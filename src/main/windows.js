import { BrowserWindow, shell, powerSaveBlocker, Tray, Menu, app } from 'electron'
import { join } from 'path'
import icon from '../../resources/icon.png?asset'
import { is } from '@electron-toolkit/utils'
import path from 'path'

let tray = null

export function createMainWindow() {
    // Enforce single instance
    const gotTheLock = app.requestSingleInstanceLock()
    
    if (!gotTheLock) {
        app.quit()
        return null
    }

    // Handle second instance
    app.on('second-instance', () => {
        // Someone tried to run a second instance, focus our window instead
        if (mainWindow) {
            if (mainWindow.isMinimized()) mainWindow.restore()
            mainWindow.focus()
        }
    })

    // Start power save blocker
    const powerSaveId = powerSaveBlocker.start('prevent-display-sleep')
    
    const mainWindow = new BrowserWindow({
        title: "WhatsApp Auto Smart Assistant 'WASA'",
        icon: path.join(__dirname, '../../resources/icon.ico'),
        width: 900,
        height: 670,
        show: false,
        autoHideMenuBar: true,
        ...(process.platform === 'linux' ? { icon } : {}),
        webPreferences: {
            preload: join(__dirname, '../preload/index.js'),
            sandbox: false,
            nodeIntegration: true,
            contextIsolation: true,
            devTools: false,
            backgroundThrottling: false  // Add this line to prevent background throttling
        }
    })

    mainWindow.setTitle("WhatsApp Auto Smart Assistant 'WASA'")
 

    // Create tray icon
    tray = new Tray(icon)
    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'Show App',
            click: () => {
                mainWindow.show()
            }
        },
        {
            label: 'Exit',
            click: () => {
                app.quit()
            }
        }
    ])
    
    tray.setToolTip('WASA')
    tray.setContextMenu(contextMenu)

    // Handle tray icon click
    tray.on('click', () => {
        mainWindow.show()
    })

    // Handle window minimize
    mainWindow.on('minimize', (event) => {
        event.preventDefault()
        mainWindow.hide()
    })

    // Handle window close button
    mainWindow.on('close', (event) => {
        // Stop power save blocker if it's running
        if (powerSaveBlocker.isStarted(powerSaveId)) {
            powerSaveBlocker.stop(powerSaveId)
        }
        // Actually quit the app
        app.quit()
    })

    // Clean up tray on app quit
    app.on('before-quit', () => {
        app.isQuitting = true
    })



    mainWindow.on('ready-to-show', () => mainWindow.show())

    mainWindow.webContents.setWindowOpenHandler(details => {
        shell.openExternal(details.url)
        return { action: 'deny' }
    })

    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
        mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
    } else {
        mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
    }

    // Handle window close
    mainWindow.on('closed', () => {
        if (powerSaveBlocker.isStarted(powerSaveId)) {
            powerSaveBlocker.stop(powerSaveId)
        }
    })

    return mainWindow
}



