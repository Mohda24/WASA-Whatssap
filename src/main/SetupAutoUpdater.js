import { autoUpdater } from 'electron-updater'
import logger from './logger'

export function setupAutoUpdater(mainWindow) {
    // ❌ REMOVE THESE LINES - your custom logger doesn't have transports
    // autoUpdater.logger = logger
    // autoUpdater.logger.transports.file.level = 'info'

    // ✅ FIXED: Use console logging or your custom logger properly
    autoUpdater.logger = {
        info: (message) => {
            console.log('AutoUpdater:', message)
            logger.info(`AutoUpdater: ${message}`)
        },
        warn: (message) => {
            console.warn('AutoUpdater:', message)
            logger.warn(`AutoUpdater: ${message}`)
        },
        error: (message) => {
            console.error('AutoUpdater:', message)
            logger.error(`AutoUpdater: ${message}`)
        }
    }

    // Don't auto-download updates, we want user confirmation
    autoUpdater.autoDownload = false
    autoUpdater.autoInstallOnAppQuit = false

    // Development mode setup
    if (process.env.NODE_ENV === 'development') {
        autoUpdater.forceDevUpdateConfig = true
    }

    // Set up event listeners with better error handling
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
        // ✅ FIXED: Proper error handling without accessing undefined properties
        logger.error('Auto-updater error:', error)
        mainWindow.webContents.send('update-error', {
            message: error?.message || 'An error occurred while checking for updates'
        })
    })

    autoUpdater.on('download-progress', (progressObj) => {
        logger.info('Download progress:', progressObj)
        mainWindow.webContents.send('update-download-progress', {
            percent: Math.round(progressObj.percent || 0),
            bytesPerSecond: progressObj.bytesPerSecond || 0,
            transferred: progressObj.transferred || 0,
            total: progressObj.total || 0
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
        checkForUpdates: async () => {
            try {
                return await autoUpdater.checkForUpdates()
            } catch (error) {
                logger.error('Check for updates failed:', error)
                throw error
            }
        },
        downloadUpdate: async () => {
            try {
                return await autoUpdater.downloadUpdate()
            } catch (error) {
                logger.error('Download update failed:', error)
                throw error
            }
        },
        quitAndInstall: () => {
            autoUpdater.quitAndInstall(false, true)
        }
    }
}
