import process from "process"
import path from "path"
import electron from "electron"

import * as Service from "./Service"

let connTray = ""
let disconnTray = ""
if (process.platform === "darwin") {
	connTray = path.join(__dirname, "..", "img",
		"tray_connected_osxTemplate.png")
	disconnTray = path.join(__dirname, "..", "img",
		"tray_disconnected_osxTemplate.png")
} else if (process.platform === "win32") {
	connTray = path.join(__dirname, "..", "img",
		"tray_connected_win.png")
	disconnTray = path.join(__dirname, "..", "img",
		"tray_disconnected_win.png")
} else if (process.platform === "linux") {
	connTray = path.join(__dirname, "..", "img",
		"tray_connected_linux_light.png")
	disconnTray = path.join(__dirname, "..", "img",
		"tray_disconnected_linux_light.png")
} else {
	connTray = path.join(__dirname, "..", "img",
		"tray_connected.png")
	disconnTray = path.join(__dirname, "..", "img",
		"tray_disconnected.png")
}
let icon = path.join(__dirname, "..", "img", "logo.png")

let orig = true
if (process.argv.indexOf("--beta") !== -1) {
	orig = false
}

if (orig) {
	require("@electron/remote/main").initialize()
}

class Main {
	window: electron.BrowserWindow

	mainWindow(): void {
		let width: number
		let height: number
		let minWidth: number
		let minHeight: number
		let maxWidth: number
		let maxHeight: number
		if (process.platform === "darwin") {
			width = 340
			height = 423
			minWidth = 304
			minHeight = 352
			maxWidth = 540
			maxHeight = 642
		} else {
			width = 420
			height = 528
			minWidth = 380
			minHeight = 440
			maxWidth = 670
			maxHeight = 800
		}

		let zoomFactor = 1
		if (process.platform === "darwin") {
			zoomFactor = 0.8
		}

		if (orig) {
			this.window = new electron.BrowserWindow({
				title: "Pritunl Client",
				icon: path.join(__dirname, "..", "logo.png"),
				frame: true,
				autoHideMenuBar: true,
				fullscreen: false,
				show: false,
				width: width,
				height: height,
				minWidth: minWidth,
				minHeight: minHeight,
				maxWidth: maxWidth,
				maxHeight: maxHeight,
				backgroundColor: "#151719",
				webPreferences: {
					zoomFactor: zoomFactor,
					devTools: true,
					enableRemoteModule: true,
					nodeIntegration: true,
					contextIsolation: false
				} as any
			})
		} else {
			this.window = new electron.BrowserWindow({
				title: "Pritunl Client",
				icon: path.join(__dirname, "..", "logo.png"),
				frame: true,
				autoHideMenuBar: true,
				fullscreen: false,
				show: false,
				width: width,
				height: height,
				minWidth: minWidth,
				minHeight: minHeight,
				maxWidth: maxWidth,
				maxHeight: maxHeight,
				backgroundColor: "#151719",
				webPreferences: {
					zoomFactor: zoomFactor,
					devTools: true,
					nodeIntegration: true,
					contextIsolation: false
				}
			})
		}

		this.window.on("closed", (): void => {
			electron.app.quit()
			this.window = null
		})

		let shown = false
		this.window.on("ready-to-show", (): void => {
			if (shown) {
				return
			}
			shown = true
			this.window.show()

			if (process.argv.indexOf("--dev-tools") !== -1) {
				this.window.webContents.openDevTools()
			}
		})
		setTimeout((): void => {
			if (shown) {
				return
			}
			shown = true
			this.window.show()

			if (process.argv.indexOf("--dev-tools") !== -1) {
				this.window.webContents.openDevTools()
			}
		}, 800)

		let indexUrl = ""
		if (orig) {
			indexUrl = "file://" + path.join(__dirname, "..",
				"index_orig.html")
		} else {
			indexUrl = "file://" + path.join(__dirname, "..",
				"index.html")
		}
		indexUrl += "?dev=" + (process.argv.indexOf("--dev") !== -1 ?
			"true" : "false")
		indexUrl += "&dataPath=" + encodeURIComponent(
			electron.app.getPath("userData"))

		this.window.loadURL(indexUrl, {
			userAgent: "pritunl",
		})

		if (electron.app.dock) {
			electron.app.dock.show()
		}
	}

	run(): void {
		this.mainWindow()
	}
}

process.on("uncaughtException", function (error) {
	let errorMsg: string
	if (error && error.stack) {
		errorMsg = error.stack
	} else {
		errorMsg = String(error)
	}

	electron.dialog.showMessageBox(null, {
		type: "error",
		buttons: ["Exit"],
		title: "Pritunl Client - Process Error",
		message: "Error occured in main process:\n\n" + errorMsg,
	}).then(function() {
		electron.app.quit()
	})
})

if (electron.app.dock) {
	electron.app.dock.hide()
}

electron.app.on("window-all-closed", (): void => {
	// try {
	// 	config.reload((): void => {
	// 		if (true) {
	// 			electron.app.quit()
	// 		} else {
	// 			if (electron.app.dock) {
	// 				electron.app.dock.hide()
	// 			}
	// 		}
	// 	})
	// } catch (error) {
	// 	throw error
	// }
})

electron.app.on("open-file", (): void => {
	try {
		let main = new Main()
		main.run()
	} catch (error) {
		throw error
	}
})

electron.app.on("open-url", (): void => {
	try {
		let main = new Main()
		main.run()
	} catch (error) {
		throw error
	}
})

electron.app.on("activate", (): void => {
	try {
		let main = new Main()
		main.run()
	} catch (error) {
		throw error
	}
})

electron.app.on("quit", (): void => {
	try {
		electron.app.quit()
	} catch (error) {
		throw error
	}
})

electron.app.on("ready", (): void => {
	try {
		let tray = new electron.Tray(disconnTray)

		tray.on("click", function() {
			let main = new Main()
			main.run()
		})
		tray.on("double-click", function() {
			let main = new Main()
			main.run()
		})

		let trayMenu = electron.Menu.buildFromTemplate([
			{
				label: "Pritunl vTODO",
				click: function () {
					let main = new Main()
					main.run()
				}
			},
			{
				label: "Exit",
				click: function() {
					electron.app.quit()
				}
			}
		])

		tray.setToolTip("Pritunl vTODO")
		tray.setContextMenu(trayMenu)

		let appMenu = electron.Menu.buildFromTemplate([
			{
				label: "Pritunl",
				submenu: [
					{
						label: "Pritunl vTODO",
					},
					{
						label: "Close",
						accelerator: "CmdOrCtrl+Q",
						role: "close",
					},
					{
						label: "Exit",
						click: function() {
							electron.app.quit()
						},
					},
				],
			},
			{
				label: "Edit",
				submenu: [
					{
						label: "Undo",
						accelerator: "CmdOrCtrl+Z",
						role: "undo",
					},
					{
						label: "Redo",
						accelerator: "Shift+CmdOrCtrl+Z",
						role: "redo",
					},
					{
						type: "separator",
					},
					{
						label: "Cut",
						accelerator: "CmdOrCtrl+X",
						role: "cut",
					},
					{
						label: "Copy",
						accelerator: "CmdOrCtrl+C",
						role: "copy",
					},
					{
						label: "Paste",
						accelerator: "CmdOrCtrl+V",
						role: "paste",
					},
					{
						label: "Select All",
						accelerator: "CmdOrCtrl+A",
						role: "selectall",
					},
				],
			}
		] as any)
		electron.Menu.setApplicationMenu(appMenu)

		Service.connect(process.argv.indexOf("--dev") !== -1).then(() => {
			Service.wakeup().then((awake: boolean) => {
				if (awake) {
					electron.app.quit()
				} else {
					let main = new Main()
					main.run()

					Service.subscribe((event: Service.Event): void => {
						if (event.type === "wakeup") {
							Service.send("awake")

							let main = new Main()
							main.run()
						}
					})
				}
			})
		})
	} catch (error) {
		throw error
	}
})
