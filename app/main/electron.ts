import path from 'path'
import installExtension, { REDUX_DEVTOOLS } from 'electron-devtools-installer'
import { app, BrowserWindow } from 'electron'

function isDev() {
  return process.env.NODE_ENV === 'development'
}

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1400,
    height: 800,
    webPreferences: {
      devTools: true,
      nodeIntegration: true,
      contextIsolation: false,
    },
  })

  if (isDev()) {
    mainWindow.loadURL(`http://127.0.0.1:6001`)
  } else {
    mainWindow.loadURL(`file://${path.join(__dirname, '../dist/index.html')}`)
  }
}

app.whenReady().then(() => {
  if (isDev()) {
    installExtension(REDUX_DEVTOOLS)
      .then((name) => console.log(`Added Extension:  ${name}`))
      .catch((err) => console.log('An error occurred: ', err))
  }
  createWindow()
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})
