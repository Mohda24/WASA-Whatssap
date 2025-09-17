import { app, BrowserWindow } from 'electron'  // ✅ Add BrowserWindow import
import { optimizer } from '@electron-toolkit/utils'
import { createMainWindow } from './windows'
import { createAppMenu } from './menu'
import { createWhatsAppClient } from './whatssapClient'
import { registerClientEvents } from './eventHandlers'
import { registerIpcHandlers } from './ipcHandlers'
import { ensureMediaFoldersExist } from '../helpers/folderSetup'
import { initDatabase } from '../helpers/initDb'
import { loadMediaData } from '../helpers/loadMedia'
import { setupAutoUpdater } from './SetupAutoUpdater'
import path from 'path'

app.whenReady().then(() => {
  ensureMediaFoldersExist()
  const db = initDatabase()
  const mainWindow = createMainWindow()
  const userDataPath = path.join(app.getPath('userData'), 'WhatsAppBot')
  const client = createWhatsAppClient(userDataPath)

  loadMediaData()
  createAppMenu(mainWindow)
  registerClientEvents(client, mainWindow, db)
  registerIpcHandlers(client, mainWindow, db)
  
  // ✅ IMPROVED: Better auto-updater initialization with error handling
  try {
    const updater = setupAutoUpdater(mainWindow)
    
    // Check for updates on startup (after 5 seconds delay)
    setTimeout(() => {
      updater.checkForUpdates().catch(error => {
        console.error('Initial update check failed:', error)
      })
    }, 5000)

    // Check for updates every hour
    setInterval(() => {
      updater.checkForUpdates().catch(error => {
        console.error('Periodic update check failed:', error)
      })
    }, 60 * 60 * 1000)
  } catch (error) {
    console.error('Failed to setup auto-updater:', error)
  }

  client.initialize()

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})


