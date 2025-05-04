import { app } from 'electron'
import { optimizer } from '@electron-toolkit/utils'
import { createMainWindow } from './windows'
import { createAppMenu } from './menu'
import { createWhatsAppClient } from './whatssapClient'
import { registerClientEvents } from './eventHandlers'
import { registerIpcHandlers } from './ipcHandlers'
import { ensureMediaFoldersExist } from '../helpers/folderSetup'
import { initDatabase } from '../helpers/initDb'
import {loadMediaData} from '../helpers/loadMedia'
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
