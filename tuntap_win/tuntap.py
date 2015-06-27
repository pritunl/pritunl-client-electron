import os
import subprocess

ROOT_DIR = os.path.dirname(os.path.realpath(__file__))

def add_tap_adap(self):
    devcon_path = os.path.join(ROOT_DIR, 'devcon.exe')
    subprocess.check_output([devcon_path, 'install',
        'OemWin2k.inf', 'tap0902'], cwd=ROOT_DIR,
        creationflags=0x08000000)
    self.tap_adap_avail += 1

def clear_tap_adap(self):
    devcon_path = os.path.join(ROOT_DIR, 'devcon.exe')
    subprocess.check_output([devcon_path, 'remove', 'tap0902'],
        cwd=ROOT_DIR, creationflags=0x08000000)
    self.reset_networking()
