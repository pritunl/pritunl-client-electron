import os
import subprocess

def add_tap_adap(self):
    tuntap_dir = os.path.join(ROOT_DIR, 'tuntap')
    devcon_path = os.path.join(tuntap_dir, 'devcon.exe')
    subprocess.check_output([devcon_path, 'install',
        'OemWin2k.inf', 'tap0902'], cwd=tuntap_dir,
        creationflags=0x08000000)
    self.tap_adap_avail += 1

def clear_tap_adap(self):
    tuntap_dir = os.path.join(ROOT_DIR, 'tuntap')
    devcon_path = os.path.join(tuntap_dir, 'devcon.exe')
    subprocess.check_output([devcon_path, 'remove', 'tap0902'],
        cwd=tuntap_dir, creationflags=0x08000000)
    self.reset_networking()
