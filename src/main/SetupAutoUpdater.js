import { autoUpdater } from 'electron-updater'
import { dialog, app } from 'electron'
import logger from './logger'

export function setupAutoUpdater(mainWindow) {
    // Enable logging
    autoUpdater.logger = logger
    autoUpdater.logger.transports.file.level = 'info'

    // Don't auto-download updates, we want user confirmation
    autoUpdater.autoDownload = false

    // Don't auto-install on quit
    autoUpdater.autoInstallOnAppQuit = false

    // Development mode setup
    if (process.env.NODE_ENV === 'development') {
        autoUpdater.forceDevUpdateConfig = true
        // You can create a dev-app-update.yml file for local testing
    }

    // Set up event listeners
    autoUpdater.on('checking-for-update', () => {
        logger.info('Checking for update...')
        mainWindow.webContents.send('update-status', {
            status: 'checking',
            message: 'Checking for updates...'
        })
    })

    autoUpdater.on('update-available', (info) => {
        logger.info('Update available:', info)
        mainWindow.webContents.send('update-available', {
            version: info.version,
            releaseNotes: info.releaseNotes,
            releaseDate: info.releaseDate,
            downloadSize: info.files?.[0]?.size || 0
        })
    })

    autoUpdater.on('update-not-available', (info) => {
        logger.info('Update not available:', info)
        mainWindow.webContents.send('update-not-available', info)
    })

    autoUpdater.on('error', (error) => {
        logger.error('Auto-updater error:', error)
        mainWindow.webContents.send('update-error', {
            message: error.message || 'An error occurred while checking for updates'
        })
    })

    autoUpdater.on('download-progress', (progressObj) => {
        logger.info('Download progress:', progressObj)
        mainWindow.webContents.send('update-download-progress', {
            percent: Math.round(progressObj.percent),
            bytesPerSecond: progressObj.bytesPerSecond,
            transferred: progressObj.transferred,
            total: progressObj.total
        })
    })

    autoUpdater.on('update-downloaded', (info) => {
        logger.info('Update downloaded:', info)
        mainWindow.webContents.send('update-downloaded', {
            version: info.version,
            releaseNotes: info.releaseNotes
        })
    })

    return {
        checkForUpdates: () => {
            autoUpdater.checkForUpdates()
        },
        downloadUpdate: () => {
            autoUpdater.downloadUpdate()
        },
        quitAndInstall: () => {
            autoUpdater.quitAndInstall(false, true)
        }
    }
}