import sys
import os

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

class Pritunl(Service):
    _svc_name_ = 'pritunl'
    _svc_display_name_ = 'Pritunl OpenVPN Client Service'

    def start(self):
        self.runflag=True
        while self.runflag:
            self.sleep(10)
    def stop(self):
        self.runflag=False

if __name__ == "__main__":
    instart(Pritunl)
