import sys
import os
import subprocess
import threading
import json
import flask
import time

import win32serviceutil
import win32service
import win32event
import win32api
import servicemanager

class Service(win32serviceutil.ServiceFramework):
    _svc_name_ = 'unknown'
    _svc_display_name_ = 'Unknown service'

    def __init__(self, *args):
        win32serviceutil.ServiceFramework.__init__(self, *args)
        self.stop_event = win32event.CreateEvent(None, 0, 0, None)

    def log_info(self, msg):
        servicemanager.LogInfoMsg(str(msg))

    def log_warn(self, msg):
        servicemanager.LogWarningMsg(str(msg))

    def log_error(self, msg):
        servicemanager.LogErrorMsg(str(msg))

    def sleep(self, sec):
        win32api.Sleep(sec * 1000, True)

    def SvcDoRun(self):
        self.ReportServiceStatus(win32service.SERVICE_START_PENDING)
        try:
            self.log_info('Service started')
            self.ReportServiceStatus(win32service.SERVICE_RUNNING)
            self.start()
            win32event.WaitForSingleObject(
                self.stop_event, win32event.INFINITE)
        except Exception, err:
            self.log_error('Service exception: %s' % err)
            self.SvcStop()

    def SvcStop(self):
        self.ReportServiceStatus(win32service.SERVICE_STOP_PENDING)
        self.stop()
        win32event.SetEvent(self.stop_event)
        self.ReportServiceStatus(win32service.SERVICE_STOPPED)

    def start(self):
        pass

    def stop(self):
        pass

def instart(cls, stay_alive=True):
    try:
        module_path = sys.modules[cls.__module__].__file__
    except AttributeError:
        # maybe py2exe went by
        from sys import executable
        module_path=executable

    module_file = os.path.splitext(os.path.abspath(module_path))[0]
    cls._svc_reg_class_ = '%s.%s' % (module_file, cls.__name__)

    if stay_alive:
        win32api.SetConsoleCtrlHandler(lambda x: True, True)

    win32serviceutil.InstallService(
        cls._svc_reg_class_,
        cls._svc_name_,
        cls._svc_display_name_,
        startType=win32service.SERVICE_AUTO_START,
    )

    win32serviceutil.StartService(cls._svc_name_)

ROOT_DIR = os.path.dirname(os.path.realpath(__file__))
OPENVPN_PATH = os.path.normpath(os.path.join(
    ROOT_DIR, '..', 'openvpn', 'openvpn.exe'))
CONNECT_TIMEOUT = 30
CONNECTING = 'connecting'
CONNECTED = 'connected'
RECONNECTING = 'reconnecting'
DISCONNECTED = 'disconnected'
AUTH_ERROR = 'auth_error'

def jsonify(data=None, status_code=None):
    if not isinstance(data, basestring):
        data = json.dumps(data, default=lambda x: str(x))
    response = flask.Response(response=data, mimetype='application/json')
    response.headers.add('Cache-Control',
        'no-cache, no-store, must-revalidate')
    response.headers.add('Pragma', 'no-cache')
    response.headers.add('Expires', 0)
    if status_code is not None:
        response.status_code = status_code
    return response

def init_server(serv):
    app = flask.Flask('pritunl')

    @app.route('/start', methods=['POST'])
    def start_post():
        id = flask.request.form.get('id')
        path = flask.request.form.get('path')
        passwd = flask.request.form.get('passwd')

        serv.log_info('%s - %s - %s' % (id, path, passwd))

        try:
            data = serv.start_profile(id, path, passwd)
        except Exception, err:
            serv.log_error('Start exception: %s' % err)
            raise

        serv.log_info('%s' % data)

        return jsonify(data)

    @app.route('/stop', methods=['POST'])
    def stop_post():
        id = flask.request.form.get('id')

        try:
            data = serv.stop_profile(id)
        except Exception, err:
            serv.log_error('Stop exception: %s' % err)
            raise

        return jsonify({})

    @app.route('/status', methods=['GET'])
    def status_get():
        return jsonify(serv.connections)

    app.run(host='127.0.0.1', port=9770)

class Pritunl(Service):
    _svc_name_ = 'pritunl'
    _svc_display_name_ = 'Pritunl OpenVPN Client Service'

    def __init__(self, *args):
        Service.__init__(self, *args)
        self.tap_adap_used = 0
        self.tap_adap_avail = 0
        self.tap_adap_lock = threading.Lock()
        self.data_lock = threading.Lock()
        self.connections = {}

    def update_tap_adap(self):
        self.tap_adap_lock.acquire()
        try:
            ipconfig = subprocess.check_output(['ipconfig', '/all'],
                creationflags=0x08000000)
            self.tap_adap_used = 0
            self.tap_adap_avail = 0
            tap_adapter = False
            tap_disconnected = False
            for line in ipconfig.split('\n'):
                line = line.strip()
                if line == '':
                    if tap_adapter:
                        self.tap_adap_avail += 1
                        if not tap_disconnected:
                            self.tap_adap_used += 1
                    tap_adapter = False
                    tap_disconnected = False
                elif 'TAP-Windows Adapter V9' in line:
                    tap_adapter = True
                elif 'Media disconnected' in line:
                    tap_disconnected = True

        except (WindowsError, subprocess.CalledProcessError):
            self.log_warn('Failed to get tap adapter info')

        finally:
            self.tap_adap_lock.release()

    def reset_networking(self):
        for command in (
            ['route', '-f'],
            ['ipconfig', '/release'],
            ['ipconfig', '/renew'],
            ['arp', '-d', '*'],
            ['nbtstat', '-R'],
            ['nbtstat', '-RR'],
            ['ipconfig', '/flushdns'],
            ['nbtstat', '/registerdns'],
        ):
            try:
                subprocess.check_output(command, creationflags=0x08000000)
            except:
                self.log_warn('Reset networking cmd error: %s' % command)

    def start_profile(self, id, path, passwd=None):
        self.data_lock.acquire()
        try:
            data = self.connections.get(id)
            if data:
                return

            data = {
                'status': CONNECTING,
                'timestamp': int(time.time()),
                'server_addr': None,
                'client_addr': None,
                'process': None,
                'stop': False,
            }
            self.connections[id] = data
        finally:
            self.data_lock.release()

        conf_path = path + '.ovpn'
        log_path = path + '.log'

        args = [OPENVPN_PATH, '--config', conf_path]

        if passwd:
            passwd_path = path + '.passwd'

            with open(self.passwd_path, 'w') as passwd_file:
                os.chmod(passwd_path, 0600)
                passwd_file.write('pritunl_client\n')
                passwd_file.write('%s\n' % passwd)

            args.append('--auth-user-pass')
            args.append(passwd_path)

        self.log_info(' '.join(args))

        process = subprocess.Popen(args,
            stdout=subprocess.PIPE, stderr=subprocess.PIPE,
            creationflags=0x08000000)

        self.data_lock.acquire()
        try:
            stop = data['stop']
            data['process'] = process
        finally:
            self.data_lock.release()

        if stop:
            process.terminate()
            try:
                del self.connections[id]
            except KeyError:
                pass
            return

        def poll_thread():
            try:
                with open(log_path, 'w') as _:
                    pass

                while True:
                    line = process.stdout.readline()
                    if not line:
                        if process.poll() is not None:
                            break
                        else:
                            continue

                    with open(log_path, 'a') as log_file:
                        log_file.write(line.rstrip('\n'))

                    if 'Initialization Sequence Completed' in line:
                        data['status'] = CONNECTED
                    elif 'Inactivity timeout' in line:
                        data['status'] = RECONNECTING
                    elif 'AUTH_FAILED' in line or 'auth-failure' in line:
                        data['status'] = AUTH_ERROR
                    elif 'link remote:' in line:
                        s_index = line.rfind(']') + 1
                        e_index = line.rfind(':')
                        data['server_addr'] = line[s_index:e_index]
                    elif 'network/local/netmask' in line:
                        e_index = line.rfind('/')
                        line = line[:e_index]
                        s_index = line.rfind('/') + 1
                        data['client_addr'] = line[s_index:]

                try:
                    if os.path.exists(self.passwd_path):
                        os.remove(self.passwd_path)
                except:
                    pass

            finally:
                try:
                    del self.connections[id]
                except KeyError:
                    pass

                # TODO Reset networking

        thread = threading.Thread(target=poll_thread)
        thread.daemon = True
        thread.start()

        return data

    def stop_profile(self, id):
        data = self.connections.get(id)
        if not data:
            return

        self.data_lock.acquire()
        try:
            data['stop'] = True
            process = data['process']
        finally:
            self.data_lock.release()

        if process:
            process.terminate()

    def start(self):
        self.update_tap_adap()

        self.log_info('Current tap adapters: %s/%s' % (
            self.tap_adap_used, self.tap_adap_avail))

        init_server(self)

    def stop(self):
        self.runflag=False

if __name__ == "__main__":
    instart(Pritunl)
