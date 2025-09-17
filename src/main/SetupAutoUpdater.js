import { autoUpdater } from 'electron-updater'
import logger from './logger'

export function setupAutoUpdater(mainWindow) {
    // Configure auto-updater
    autoUpdater.autoDownload = false
    autoUpdater.autoInstallOnAppQuit = false
    
    // Set update server (GitHub releases)
    autoUpdater.setFeedURL({
        provider: 'github',
        owner: 'Mohda24',
        repo: 'WASA-Whatssap',
        releaseType: 'release'
    })

    // Set up event listeners
    autoUpdater.on('checking-for-update', () => {
        logger.info('Checking for update...')
        mainWindow.webContents.send('update-status', {
            status: 'checking',
            message: 'Checking for updates...'
        })
    })

    autoUpdater.on('update-available', (info) => {
        logger.info(`Update available: ${info.version}`)
        mainWindow.webContents.send('update-available', {
            version: info.version,
            releaseNotes: info.releaseNotes,
            releaseDate: info.releaseDate,
            downloadSize: info.files?.[0]?.size || 0
        })
    })

    autoUpdater.on('update-not-available', (info) => {
        logger.info('Update not available')
        mainWindow.webContents.send('update-not-available', info)
    })

    autoUpdater.on('error', (error) => {
        logger.error('Auto-updater error:', error)
        mainWindow.webContents.send('update-error', {
            message: error?.message || 'An error occurred while checking for updates'
        })
    })

    autoUpdater.on('download-progress', (progressObj) => {
        const percent = Math.round(progressObj.percent || 0)
        logger.info(`Download progress: ${percent}%`)
        mainWindow.webContents.send('update-download-progress', {
            percent,
            bytesPerSecond: progressObj.bytesPerSecond || 0,
            transferred: progressObj.transferred || 0,
            total: progressObj.total || 0
        })
    })

    autoUpdater.on('update-downloaded', (info) => {
        logger.info(`Update downloaded: ${info.version}`)
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