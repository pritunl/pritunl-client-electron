import process from "process";
import path from "path";
import electron from "electron";

class Main {
	window: electron.BrowserWindow;

	mainWindow(): void {
		let width: number;
		let height: number;
		let minWidth: number;
		let minHeight: number;
		let maxWidth: number;
		let maxHeight: number;
		if (process.platform === 'darwin') {
			width = 340;
			height = 423;
			minWidth = 304;
			minHeight = 352;
			maxWidth = 540;
			maxHeight = 642;
		} else {
			width = 420;
			height = 528;
			minWidth = 380;
			minHeight = 440;
			maxWidth = 670;
			maxHeight = 800;
		}

		let zoomFactor = 1;
		if (process.platform === 'darwin') {
			zoomFactor = 0.8;
		}

		this.window = new electron.BrowserWindow({
			title: 'Pritunl Client',
			icon: path.join(__dirname, '..', 'logo.png'),
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
			backgroundColor: '#151719',
			webPreferences: {
				zoomFactor: zoomFactor,
				devTools: true,
				nodeIntegration: true,
				contextIsolation: false
			}
		});

		this.window.on('closed', (): void => {
			Electron.app.quit();
			this.window = null;
		});

		let shown = false;
		this.window.on('ready-to-show', (): void => {
			if (shown) {
				return;
			}
			shown = true;
			this.window.show();

			if (process.argv.indexOf('--dev-tools') !== -1) {
				this.window.webContents.openDevTools();
			}
		});
		setTimeout((): void => {
			if (shown) {
				return;
			}
			shown = true;
			this.window.show();

			if (process.argv.indexOf('--dev-tools') !== -1) {
				this.window.webContents.openDevTools();
			}
		}, 800);

		let indexUrl = 'file://' + path.join(__dirname, '..', 'index.html');
		indexUrl += '?dev=' + (process.argv.indexOf('--dev') !== -1 ?
			'true' : 'false');

		this.window.loadURL(indexUrl);

		if (electron.app.dock) {
			electron.app.dock.show();
		}
	}

	run(): void {
		this.mainWindow();
	}
}

process.on('uncaughtException', function (error) {
	let errorMsg: string;
	if (error && error.stack) {
		errorMsg = error.stack;
	} else {
		errorMsg = String(error);
	}

	electron.dialog.showMessageBox(null, {
		type: 'error',
		buttons: ['Exit'],
		title: 'Pritunl Client - Process Error',
		message: 'Error occured in main process:\n\n' + errorMsg,
	}).then(function() {
		electron.app.quit();
	});
});

if (electron.app.dock) {
	electron.app.dock.hide();
}

electron.app.on('window-all-closed', (): void => {
	// config.reload((): void => {
	// 	if (true) {
	// 		electron.app.quit();
	// 	} else {
	// 		if (electron.app.dock) {
	// 			electron.app.dock.hide();
	// 		}
	// 	}
	// });
});

electron.app.on('open-file', (): void => {
	let main = new Main();
	main.run();
});

electron.app.on('open-url', (): void => {
	let main = new Main();
	main.run();
});

electron.app.on('activate', (): void => {
	let main = new Main();
	main.run();
});

electron.app.on('quit', (): void => {
	electron.app.quit();
});

electron.app.on('ready', (): void => {
	let tray = new electron.Tray(path.join(__dirname, '..', 'logo.png'));

	tray.on('click', function() {
		let main = new Main();
		main.run();
	});
	tray.on('double-click', function() {
		let main = new Main();
		main.run();
	});

	let trayMenu = electron.Menu.buildFromTemplate([
		{
			label: 'Pritunl vTODO',
			click: function () {
				let main = new Main();
				main.run();
			}
		},
		{
			label: 'Exit',
			click: function() {
				electron.app.quit();
			}
		}
	]);

	tray.setToolTip('Pritunl vTODO');
	tray.setContextMenu(trayMenu);

	let main = new Main();
	main.run();
});
