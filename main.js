require('dotenv').config();
// Modules to control application life and create native browser window
const {app, BrowserWindow, Notification} = require('electron');
const path = require('path');
const {autoUpdater} = require("electron-updater");

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

function createWindow() {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: true
        }
    });

    // and load the index.html of the app.
    mainWindow.loadFile('index.html');

    // Open the DevTools.
    // mainWindow.webContents.openDevTools()

    // Emitted when the window is closed.
    mainWindow.on('closed', function () {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null
    });

    mainWindow.webContents.toggleDevTools();

    autoUpdater.setFeedURL({
        provider: 'github',
        owner: 'strotmann',
        repo: 'electron-updater-test',
        private: false,
        token: process.env.GH_TOKEN,
    });

    autoUpdater.checkForUpdates();
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function () {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') app.quit()
});

app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) createWindow()
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

/********** autoUpdater **********/
autoUpdater.on('checking-for-update', () => {
    setStatusToWindow('Checking for update...');
});
autoUpdater.on('update-available', (info) => {
    setStatusToWindow('Update available.');
});
autoUpdater.on('update-not-available', (info) => {
    setStatusToWindow('Update not available.');
});
autoUpdater.on('error', (err) => {
    setStatusToWindow('Error in auto-updater. ' + err);
});
autoUpdater.on('download-progress', (progressObj) => {
    let log_message = `Downloaded: ${progressObj.percent.toFixed(0)} % - speed: ${progressObj.bytesPerSecond}`;
    setStatusToWindow(log_message);
});
autoUpdater.on('update-downloaded', (ev) => {
    isUpdating = true;
    if (process.platform === 'win32') {
        const dialogOpts = {
            type: 'info',
            buttons: ['Restart', 'Later'],
            defaultId: 0,
            icon: nativeImage.createFromPath(path.join(__dirname, '/res/images/win32/ic_launcher.ico')),
            message: 'A new version has been downloaded. Restart the application to apply the updates.'
        };
        dialog.showMessageBox(dialogOpts, (response) => {
            if (response === 0) autoUpdater.quitAndInstall();
        });
    } else {
        const notify = new Notification({
            title: 'Awery ERP',
            closeButtonText: 'Close',
            actions: [{text: 'Restart', type: 'button'}],
            body: `Desktop application version updated to: ${ev.version}`
        });
        notify.on('action', (e) => {
            setStatusToWindow(e);
            autoUpdater.quitAndInstall();
        });
        notify.show();
    }
});

const setStatusToWindow = (text) => {
    mainWindow.webContents.send('upd-message', text);
};
/********** autoUpdater **********/
