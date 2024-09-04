const wix = require("electron-wix-msi")
const path = require("path")

// https://github.com/wixtoolset/wix3/releases/tag/wix3141rtm

async function packageApp() {
  const msiCreator = new wix.MSICreator({
    appDirectory: "..\\build\\win\\pritunl-win32-x64\\",
    description: "Pritunl Enterprise VPN Client",
    exe: "Pritunl",
    name: "Pritunl",
    manufacturer: "Pritunl",
    appUserModelId: "com.pritunl.client",
    upgradeCode: "4D794255-3D77-4574-928F-119D1450224D",
    icon: ".\\www\\img\\logo.ico",
    version: "1.3.3883.60",
    outputDirectory: "..\\build\\"
    //signWithParams: "todo signtool.exe",
    // ui: {
    //   images: {
    //     background: "493x312",
    //     banner: "493x58",
    //
    //   }
    // }
  })

  const supportBinaries = await msiCreator.create()

  // supportBinaries.forEach(async (binary) => {
  //   console.log("**************************************************")
  //   console.log(binary)
  //   console.log("**************************************************")
  //   //await signFile(binary)
  // })

  await msiCreator.compile()

  console.log("**************************************************")
  console.log("done")
  console.log("**************************************************")
}

packageApp()
