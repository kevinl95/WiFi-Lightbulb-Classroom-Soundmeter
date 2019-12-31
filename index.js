const { app, BrowserWindow } = require('electron')

function createWindow () {
  // Create the browser window.
  let win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    },
    icon: __dirname + '/icon.ico'
  })

  // Hide the menu bar
  win.setMenu(null)

  // and load the index.html of the app.
  win.loadFile('index.html')
}

app.on('ready', createWindow)
