/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "electron":
/*!***************************!*\
  !*** external "electron" ***!
  \***************************/
/***/ ((module) => {

module.exports = require("electron");

/***/ }),

/***/ "path":
/*!***********************!*\
  !*** external "path" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("path");

/***/ }),

/***/ "process":
/*!**************************!*\
  !*** external "process" ***!
  \**************************/
/***/ ((module) => {

module.exports = require("process");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/*!**********************!*\
  !*** ./main/Main.js ***!
  \**********************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var process__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! process */ "process");
/* harmony import */ var process__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(process__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var path__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! path */ "path");
/* harmony import */ var path__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(path__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var electron__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! electron */ "electron");
/* harmony import */ var electron__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(electron__WEBPACK_IMPORTED_MODULE_2__);



class Main {
    mainWindow() {
        let width;
        let height;
        let minWidth;
        let minHeight;
        let maxWidth;
        let maxHeight;
        if ((process__WEBPACK_IMPORTED_MODULE_0___default().platform) === 'darwin') {
            width = 340;
            height = 423;
            minWidth = 304;
            minHeight = 352;
            maxWidth = 540;
            maxHeight = 642;
        }
        else {
            width = 420;
            height = 528;
            minWidth = 380;
            minHeight = 440;
            maxWidth = 670;
            maxHeight = 800;
        }
        let zoomFactor = 1;
        if ((process__WEBPACK_IMPORTED_MODULE_0___default().platform) === 'darwin') {
            zoomFactor = 0.8;
        }
        this.window = new (electron__WEBPACK_IMPORTED_MODULE_2___default().BrowserWindow)({
            title: 'Pritunl Client',
            icon: path__WEBPACK_IMPORTED_MODULE_1___default().join(__dirname, '..', 'logo.png'),
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
        this.window.on('closed', () => {
            electron__WEBPACK_IMPORTED_MODULE_2___default().app.quit();
            this.window = null;
        });
        let shown = false;
        this.window.on('ready-to-show', () => {
            if (shown) {
                return;
            }
            shown = true;
            this.window.show();
            if (process__WEBPACK_IMPORTED_MODULE_0___default().argv.indexOf('--dev-tools') !== -1) {
                this.window.webContents.openDevTools();
            }
        });
        setTimeout(() => {
            if (shown) {
                return;
            }
            shown = true;
            this.window.show();
            if (process__WEBPACK_IMPORTED_MODULE_0___default().argv.indexOf('--dev-tools') !== -1) {
                this.window.webContents.openDevTools();
            }
        }, 800);
        let indexUrl = 'file://' + path__WEBPACK_IMPORTED_MODULE_1___default().join(__dirname, '..', 'index.html');
        indexUrl += '?dev=' + (process__WEBPACK_IMPORTED_MODULE_0___default().argv.indexOf('--dev') !== -1 ?
            'true' : 'false');
        indexUrl += '&dataPath=' + encodeURIComponent(electron__WEBPACK_IMPORTED_MODULE_2___default().app.getPath('userData'));
        this.window.loadURL(indexUrl, {
            userAgent: "pritunl",
        });
        if ((electron__WEBPACK_IMPORTED_MODULE_2___default().app.dock)) {
            electron__WEBPACK_IMPORTED_MODULE_2___default().app.dock.show();
        }
    }
    run() {
        this.mainWindow();
    }
}
process__WEBPACK_IMPORTED_MODULE_0___default().on('uncaughtException', function (error) {
    let errorMsg;
    if (error && error.stack) {
        errorMsg = error.stack;
    }
    else {
        errorMsg = String(error);
    }
    electron__WEBPACK_IMPORTED_MODULE_2___default().dialog.showMessageBox(null, {
        type: 'error',
        buttons: ['Exit'],
        title: 'Pritunl Client - Process Error',
        message: 'Error occured in main process:\n\n' + errorMsg,
    }).then(function () {
        electron__WEBPACK_IMPORTED_MODULE_2___default().app.quit();
    });
});
if ((electron__WEBPACK_IMPORTED_MODULE_2___default().app.dock)) {
    electron__WEBPACK_IMPORTED_MODULE_2___default().app.dock.hide();
}
electron__WEBPACK_IMPORTED_MODULE_2___default().app.on('window-all-closed', () => {
});
electron__WEBPACK_IMPORTED_MODULE_2___default().app.on('open-file', () => {
    let main = new Main();
    main.run();
});
electron__WEBPACK_IMPORTED_MODULE_2___default().app.on('open-url', () => {
    let main = new Main();
    main.run();
});
electron__WEBPACK_IMPORTED_MODULE_2___default().app.on('activate', () => {
    let main = new Main();
    main.run();
});
electron__WEBPACK_IMPORTED_MODULE_2___default().app.on('quit', () => {
    electron__WEBPACK_IMPORTED_MODULE_2___default().app.quit();
});
electron__WEBPACK_IMPORTED_MODULE_2___default().app.on('ready', () => {
    let tray = new (electron__WEBPACK_IMPORTED_MODULE_2___default().Tray)(path__WEBPACK_IMPORTED_MODULE_1___default().join(__dirname, '..', 'logo.png'));
    tray.on('click', function () {
        let main = new Main();
        main.run();
    });
    tray.on('double-click', function () {
        let main = new Main();
        main.run();
    });
    let trayMenu = electron__WEBPACK_IMPORTED_MODULE_2___default().Menu.buildFromTemplate([
        {
            label: 'Pritunl vTODO',
            click: function () {
                let main = new Main();
                main.run();
            }
        },
        {
            label: 'Exit',
            click: function () {
                electron__WEBPACK_IMPORTED_MODULE_2___default().app.quit();
            }
        }
    ]);
    tray.setToolTip('Pritunl vTODO');
    tray.setContextMenu(trayMenu);
    let main = new Main();
    main.run();
});
//# sourceMappingURL=Main.js.map
})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUE7Ozs7Ozs7Ozs7QUNBQTs7Ozs7Ozs7OztBQ0FBOzs7Ozs7VUNBQTtVQUNBOztVQUVBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBOztVQUVBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBOzs7OztXQ3RCQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0EsaUNBQWlDLFdBQVc7V0FDNUM7V0FDQTs7Ozs7V0NQQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLHlDQUF5Qyx3Q0FBd0M7V0FDakY7V0FDQTtXQUNBOzs7OztXQ1BBOzs7OztXQ0FBO1dBQ0E7V0FDQTtXQUNBLHVEQUF1RCxpQkFBaUI7V0FDeEU7V0FDQSxnREFBZ0QsYUFBYTtXQUM3RDs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNOOEI7QUFDTjtBQUNRO0FBQ2hDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFZLHlEQUFnQjtBQUM1QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVkseURBQWdCO0FBQzVCO0FBQ0E7QUFDQSwwQkFBMEIsK0RBQXNCO0FBQ2hEO0FBQ0Esa0JBQWtCLGdEQUFTO0FBQzNCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQSxZQUFZLHdEQUFpQjtBQUM3QjtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGdCQUFnQiwyREFBb0I7QUFDcEM7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxnQkFBZ0IsMkRBQW9CO0FBQ3BDO0FBQ0E7QUFDQSxTQUFTO0FBQ1QsbUNBQW1DLGdEQUFTO0FBQzVDLCtCQUErQiwyREFBb0I7QUFDbkQ7QUFDQSxzREFBc0QsMkRBQW9CO0FBQzFFO0FBQ0E7QUFDQSxTQUFTO0FBQ1QsWUFBWSwwREFBaUI7QUFDN0IsWUFBWSw2REFBc0I7QUFDbEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaURBQVU7QUFDVjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUkscUVBQThCO0FBQ2xDO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMLFFBQVEsd0RBQWlCO0FBQ3pCLEtBQUs7QUFDTCxDQUFDO0FBQ0QsSUFBSSwwREFBaUI7QUFDckIsSUFBSSw2REFBc0I7QUFDMUI7QUFDQSxzREFBZTtBQUNmLENBQUM7QUFDRCxzREFBZTtBQUNmO0FBQ0E7QUFDQSxDQUFDO0FBQ0Qsc0RBQWU7QUFDZjtBQUNBO0FBQ0EsQ0FBQztBQUNELHNEQUFlO0FBQ2Y7QUFDQTtBQUNBLENBQUM7QUFDRCxzREFBZTtBQUNmLElBQUksd0RBQWlCO0FBQ3JCLENBQUM7QUFDRCxzREFBZTtBQUNmLG1CQUFtQixzREFBYSxDQUFDLGdEQUFTO0FBQzFDO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0wsbUJBQW1CLHNFQUErQjtBQUNsRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0EsZ0JBQWdCLHdEQUFpQjtBQUNqQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLENBQUM7QUFDRCxnQyIsInNvdXJjZXMiOlsid2VicGFjazovL3ByaXR1bmwvZXh0ZXJuYWwgbm9kZS1jb21tb25qcyBcImVsZWN0cm9uXCIiLCJ3ZWJwYWNrOi8vcHJpdHVubC9leHRlcm5hbCBub2RlLWNvbW1vbmpzIFwicGF0aFwiIiwid2VicGFjazovL3ByaXR1bmwvZXh0ZXJuYWwgbm9kZS1jb21tb25qcyBcInByb2Nlc3NcIiIsIndlYnBhY2s6Ly9wcml0dW5sL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL3ByaXR1bmwvd2VicGFjay9ydW50aW1lL2NvbXBhdCBnZXQgZGVmYXVsdCBleHBvcnQiLCJ3ZWJwYWNrOi8vcHJpdHVubC93ZWJwYWNrL3J1bnRpbWUvZGVmaW5lIHByb3BlcnR5IGdldHRlcnMiLCJ3ZWJwYWNrOi8vcHJpdHVubC93ZWJwYWNrL3J1bnRpbWUvaGFzT3duUHJvcGVydHkgc2hvcnRoYW5kIiwid2VicGFjazovL3ByaXR1bmwvd2VicGFjay9ydW50aW1lL21ha2UgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly9wcml0dW5sLy4vbWFpbi9NYWluLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcImVsZWN0cm9uXCIpOyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcInBhdGhcIik7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwicHJvY2Vzc1wiKTsiLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdKG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiLy8gZ2V0RGVmYXVsdEV4cG9ydCBmdW5jdGlvbiBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1oYXJtb255IG1vZHVsZXNcbl9fd2VicGFja19yZXF1aXJlX18ubiA9IChtb2R1bGUpID0+IHtcblx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG5cdFx0KCkgPT4gKG1vZHVsZVsnZGVmYXVsdCddKSA6XG5cdFx0KCkgPT4gKG1vZHVsZSk7XG5cdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsIHsgYTogZ2V0dGVyIH0pO1xuXHRyZXR1cm4gZ2V0dGVyO1xufTsiLCIvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9ucyBmb3IgaGFybW9ueSBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSAoZXhwb3J0cywgZGVmaW5pdGlvbikgPT4ge1xuXHRmb3IodmFyIGtleSBpbiBkZWZpbml0aW9uKSB7XG5cdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGRlZmluaXRpb24sIGtleSkgJiYgIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBrZXkpKSB7XG5cdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywga2V5LCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZGVmaW5pdGlvbltrZXldIH0pO1xuXHRcdH1cblx0fVxufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSAob2JqLCBwcm9wKSA9PiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCkpIiwiLy8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5yID0gKGV4cG9ydHMpID0+IHtcblx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdH1cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbn07IiwiaW1wb3J0IHByb2Nlc3MgZnJvbSBcInByb2Nlc3NcIjtcbmltcG9ydCBwYXRoIGZyb20gXCJwYXRoXCI7XG5pbXBvcnQgZWxlY3Ryb24gZnJvbSBcImVsZWN0cm9uXCI7XG5jbGFzcyBNYWluIHtcbiAgICBtYWluV2luZG93KCkge1xuICAgICAgICBsZXQgd2lkdGg7XG4gICAgICAgIGxldCBoZWlnaHQ7XG4gICAgICAgIGxldCBtaW5XaWR0aDtcbiAgICAgICAgbGV0IG1pbkhlaWdodDtcbiAgICAgICAgbGV0IG1heFdpZHRoO1xuICAgICAgICBsZXQgbWF4SGVpZ2h0O1xuICAgICAgICBpZiAocHJvY2Vzcy5wbGF0Zm9ybSA9PT0gJ2RhcndpbicpIHtcbiAgICAgICAgICAgIHdpZHRoID0gMzQwO1xuICAgICAgICAgICAgaGVpZ2h0ID0gNDIzO1xuICAgICAgICAgICAgbWluV2lkdGggPSAzMDQ7XG4gICAgICAgICAgICBtaW5IZWlnaHQgPSAzNTI7XG4gICAgICAgICAgICBtYXhXaWR0aCA9IDU0MDtcbiAgICAgICAgICAgIG1heEhlaWdodCA9IDY0MjtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHdpZHRoID0gNDIwO1xuICAgICAgICAgICAgaGVpZ2h0ID0gNTI4O1xuICAgICAgICAgICAgbWluV2lkdGggPSAzODA7XG4gICAgICAgICAgICBtaW5IZWlnaHQgPSA0NDA7XG4gICAgICAgICAgICBtYXhXaWR0aCA9IDY3MDtcbiAgICAgICAgICAgIG1heEhlaWdodCA9IDgwMDtcbiAgICAgICAgfVxuICAgICAgICBsZXQgem9vbUZhY3RvciA9IDE7XG4gICAgICAgIGlmIChwcm9jZXNzLnBsYXRmb3JtID09PSAnZGFyd2luJykge1xuICAgICAgICAgICAgem9vbUZhY3RvciA9IDAuODtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLndpbmRvdyA9IG5ldyBlbGVjdHJvbi5Ccm93c2VyV2luZG93KHtcbiAgICAgICAgICAgIHRpdGxlOiAnUHJpdHVubCBDbGllbnQnLFxuICAgICAgICAgICAgaWNvbjogcGF0aC5qb2luKF9fZGlybmFtZSwgJy4uJywgJ2xvZ28ucG5nJyksXG4gICAgICAgICAgICBmcmFtZTogdHJ1ZSxcbiAgICAgICAgICAgIGF1dG9IaWRlTWVudUJhcjogdHJ1ZSxcbiAgICAgICAgICAgIGZ1bGxzY3JlZW46IGZhbHNlLFxuICAgICAgICAgICAgc2hvdzogZmFsc2UsXG4gICAgICAgICAgICB3aWR0aDogd2lkdGgsXG4gICAgICAgICAgICBoZWlnaHQ6IGhlaWdodCxcbiAgICAgICAgICAgIG1pbldpZHRoOiBtaW5XaWR0aCxcbiAgICAgICAgICAgIG1pbkhlaWdodDogbWluSGVpZ2h0LFxuICAgICAgICAgICAgbWF4V2lkdGg6IG1heFdpZHRoLFxuICAgICAgICAgICAgbWF4SGVpZ2h0OiBtYXhIZWlnaHQsXG4gICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6ICcjMTUxNzE5JyxcbiAgICAgICAgICAgIHdlYlByZWZlcmVuY2VzOiB7XG4gICAgICAgICAgICAgICAgem9vbUZhY3Rvcjogem9vbUZhY3RvcixcbiAgICAgICAgICAgICAgICBkZXZUb29sczogdHJ1ZSxcbiAgICAgICAgICAgICAgICBub2RlSW50ZWdyYXRpb246IHRydWUsXG4gICAgICAgICAgICAgICAgY29udGV4dElzb2xhdGlvbjogZmFsc2VcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMud2luZG93Lm9uKCdjbG9zZWQnLCAoKSA9PiB7XG4gICAgICAgICAgICBlbGVjdHJvbi5hcHAucXVpdCgpO1xuICAgICAgICAgICAgdGhpcy53aW5kb3cgPSBudWxsO1xuICAgICAgICB9KTtcbiAgICAgICAgbGV0IHNob3duID0gZmFsc2U7XG4gICAgICAgIHRoaXMud2luZG93Lm9uKCdyZWFkeS10by1zaG93JywgKCkgPT4ge1xuICAgICAgICAgICAgaWYgKHNob3duKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc2hvd24gPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy53aW5kb3cuc2hvdygpO1xuICAgICAgICAgICAgaWYgKHByb2Nlc3MuYXJndi5pbmRleE9mKCctLWRldi10b29scycpICE9PSAtMSkge1xuICAgICAgICAgICAgICAgIHRoaXMud2luZG93LndlYkNvbnRlbnRzLm9wZW5EZXZUb29scygpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICBpZiAoc2hvd24pIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzaG93biA9IHRydWU7XG4gICAgICAgICAgICB0aGlzLndpbmRvdy5zaG93KCk7XG4gICAgICAgICAgICBpZiAocHJvY2Vzcy5hcmd2LmluZGV4T2YoJy0tZGV2LXRvb2xzJykgIT09IC0xKSB7XG4gICAgICAgICAgICAgICAgdGhpcy53aW5kb3cud2ViQ29udGVudHMub3BlbkRldlRvb2xzKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIDgwMCk7XG4gICAgICAgIGxldCBpbmRleFVybCA9ICdmaWxlOi8vJyArIHBhdGguam9pbihfX2Rpcm5hbWUsICcuLicsICdpbmRleC5odG1sJyk7XG4gICAgICAgIGluZGV4VXJsICs9ICc/ZGV2PScgKyAocHJvY2Vzcy5hcmd2LmluZGV4T2YoJy0tZGV2JykgIT09IC0xID9cbiAgICAgICAgICAgICd0cnVlJyA6ICdmYWxzZScpO1xuICAgICAgICBpbmRleFVybCArPSAnJmRhdGFQYXRoPScgKyBlbmNvZGVVUklDb21wb25lbnQoZWxlY3Ryb24uYXBwLmdldFBhdGgoJ3VzZXJEYXRhJykpO1xuICAgICAgICB0aGlzLndpbmRvdy5sb2FkVVJMKGluZGV4VXJsLCB7XG4gICAgICAgICAgICB1c2VyQWdlbnQ6IFwicHJpdHVubFwiLFxuICAgICAgICB9KTtcbiAgICAgICAgaWYgKGVsZWN0cm9uLmFwcC5kb2NrKSB7XG4gICAgICAgICAgICBlbGVjdHJvbi5hcHAuZG9jay5zaG93KCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcnVuKCkge1xuICAgICAgICB0aGlzLm1haW5XaW5kb3coKTtcbiAgICB9XG59XG5wcm9jZXNzLm9uKCd1bmNhdWdodEV4Y2VwdGlvbicsIGZ1bmN0aW9uIChlcnJvcikge1xuICAgIGxldCBlcnJvck1zZztcbiAgICBpZiAoZXJyb3IgJiYgZXJyb3Iuc3RhY2spIHtcbiAgICAgICAgZXJyb3JNc2cgPSBlcnJvci5zdGFjaztcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGVycm9yTXNnID0gU3RyaW5nKGVycm9yKTtcbiAgICB9XG4gICAgZWxlY3Ryb24uZGlhbG9nLnNob3dNZXNzYWdlQm94KG51bGwsIHtcbiAgICAgICAgdHlwZTogJ2Vycm9yJyxcbiAgICAgICAgYnV0dG9uczogWydFeGl0J10sXG4gICAgICAgIHRpdGxlOiAnUHJpdHVubCBDbGllbnQgLSBQcm9jZXNzIEVycm9yJyxcbiAgICAgICAgbWVzc2FnZTogJ0Vycm9yIG9jY3VyZWQgaW4gbWFpbiBwcm9jZXNzOlxcblxcbicgKyBlcnJvck1zZyxcbiAgICB9KS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgZWxlY3Ryb24uYXBwLnF1aXQoKTtcbiAgICB9KTtcbn0pO1xuaWYgKGVsZWN0cm9uLmFwcC5kb2NrKSB7XG4gICAgZWxlY3Ryb24uYXBwLmRvY2suaGlkZSgpO1xufVxuZWxlY3Ryb24uYXBwLm9uKCd3aW5kb3ctYWxsLWNsb3NlZCcsICgpID0+IHtcbn0pO1xuZWxlY3Ryb24uYXBwLm9uKCdvcGVuLWZpbGUnLCAoKSA9PiB7XG4gICAgbGV0IG1haW4gPSBuZXcgTWFpbigpO1xuICAgIG1haW4ucnVuKCk7XG59KTtcbmVsZWN0cm9uLmFwcC5vbignb3Blbi11cmwnLCAoKSA9PiB7XG4gICAgbGV0IG1haW4gPSBuZXcgTWFpbigpO1xuICAgIG1haW4ucnVuKCk7XG59KTtcbmVsZWN0cm9uLmFwcC5vbignYWN0aXZhdGUnLCAoKSA9PiB7XG4gICAgbGV0IG1haW4gPSBuZXcgTWFpbigpO1xuICAgIG1haW4ucnVuKCk7XG59KTtcbmVsZWN0cm9uLmFwcC5vbigncXVpdCcsICgpID0+IHtcbiAgICBlbGVjdHJvbi5hcHAucXVpdCgpO1xufSk7XG5lbGVjdHJvbi5hcHAub24oJ3JlYWR5JywgKCkgPT4ge1xuICAgIGxldCB0cmF5ID0gbmV3IGVsZWN0cm9uLlRyYXkocGF0aC5qb2luKF9fZGlybmFtZSwgJy4uJywgJ2xvZ28ucG5nJykpO1xuICAgIHRyYXkub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xuICAgICAgICBsZXQgbWFpbiA9IG5ldyBNYWluKCk7XG4gICAgICAgIG1haW4ucnVuKCk7XG4gICAgfSk7XG4gICAgdHJheS5vbignZG91YmxlLWNsaWNrJywgZnVuY3Rpb24gKCkge1xuICAgICAgICBsZXQgbWFpbiA9IG5ldyBNYWluKCk7XG4gICAgICAgIG1haW4ucnVuKCk7XG4gICAgfSk7XG4gICAgbGV0IHRyYXlNZW51ID0gZWxlY3Ryb24uTWVudS5idWlsZEZyb21UZW1wbGF0ZShbXG4gICAgICAgIHtcbiAgICAgICAgICAgIGxhYmVsOiAnUHJpdHVubCB2VE9ETycsXG4gICAgICAgICAgICBjbGljazogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGxldCBtYWluID0gbmV3IE1haW4oKTtcbiAgICAgICAgICAgICAgICBtYWluLnJ1bigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBsYWJlbDogJ0V4aXQnLFxuICAgICAgICAgICAgY2xpY2s6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBlbGVjdHJvbi5hcHAucXVpdCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgXSk7XG4gICAgdHJheS5zZXRUb29sVGlwKCdQcml0dW5sIHZUT0RPJyk7XG4gICAgdHJheS5zZXRDb250ZXh0TWVudSh0cmF5TWVudSk7XG4gICAgbGV0IG1haW4gPSBuZXcgTWFpbigpO1xuICAgIG1haW4ucnVuKCk7XG59KTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPU1haW4uanMubWFwIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9