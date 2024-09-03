const electronInstaller = require('electron-winstaller');
const path = require("path");

async function packageApp() {
  try {
    await electronInstaller.createWindowsInstaller({
      appDirectory: "..\\build\\win\\pritunl-win32-x64\\",
      outputDirectory: "..\\build\\",
      authors: "Pritunl, Inc",
      owners: "Pritunl, Inc",
      exe: "Pritunl.exe",
      description: "Pritunl Enterprise VPN Server Client",
      title: "Pritunl Client",
      name: "PritunlClient",
      setupMsi: "Pritunl.msi",
      setupExe: "Pritunl.exe",
      //signWithParams: "",
      iconUrl: "",
      setupIcon: "",
      //windowsSign: "",
    });

    console.log("Successfully packaged app");
  } catch (err) {
    console.error("Error packaging app:", err);
  }
}

packageApp();
