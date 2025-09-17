import { ipcMain, app } from 'electron'
import { saveFiles } from '../helpers/saveFiles'
import { clearMediaFolder } from '../helpers/clearMediaFolder'
import { savePhoneNumbers, resetPhoneNumbers, resetPhoneNumberById } from '../helpers/SavePhoneNumbers'
import { getPhoneNumbers } from '../helpers/getPhoneNumbers'
import { loadMediaData, getMediaData } from '../helpers/loadMedia'
import path from 'path'
import fs from 'fs'
import { createWhatsAppClient } from './whatssapClient'
import { registerClientEvents } from './eventHandlers'
import { readMediaFolder } from '../helpers/readMediaFolder'; // import it
import { getHourlyStats, resetHourlyStats } from '../helpers/CountMessages'; // import it
import { getDailyStats, resetStats } from "../helpers/StatsHelpers"
import { processBulkSending } from '../helpers/processBulkSending'
import { getBotStatus, setBotStatus } from '../helpers/BotSettingHelper'
import { autoUpdater } from 'electron-updater' // ADD THIS IMPORT


export function registerIpcHandlers(client, mainWindow, db) {
    // data
    const mediaData = getMediaData()
    // Initial Bulk Sending Data
    let bulkSendingData = {
        numbers: [],
        mediaData: [],
        currentIndex: 0,
        isSending: false
    }

    ipcMain.handle('upload-files', async (_e, { orderedData }) => {
        try {
            // const clearResult = clearMediaFolder()
            // if (!clearResult.success) throw new Error(clearResult.error)

            await saveFiles(orderedData)
            loadMediaData()
            return { success: true }
        } catch (error) {
            return { success: false, error: error.message }
        }
    })

    ipcMain.handle('init-whatsapp', async () => {
        try {
            if (!client.initialized) await client.initialize()
            return { success: true }
        } catch (err) {
            mainWindow.webContents.send('whatsapp-error', err.message)
            return { success: false, error: err.message }
        }
    })

    ipcMain.handle('logout-whatsapp', async () => {
        try {
            // First try to logout properly
            if (client.initialized) {
                try {
                    await client.logout();
                } catch (logoutErr) {
                    console.error('Error during client logout:', logoutErr);
                }
            }

            // Force destroy the client
            try {
                await client.destroy();
            } catch (destroyErr) {
                console.error('Error during client destroy:', destroyErr);
            }

            // Clear the auth folder to force a new login
            const userDataPath = app.getPath('userData');

            // Clear auth folder - this is where the session data is stored
            const authFolder = path.join(userDataPath, '.wwebjs_auth');
            if (fs.existsSync(authFolder)) {
                try {
                    fs.rmSync(authFolder, { recursive: true, force: true });
                    console.log('Auth folder deleted successfully');
                } catch (fsErr) {
                    console.error('Error deleting auth folder:', fsErr);
                }
            }

            // Clear cache folder - this contains browser cache data
            const cacheFolder = path.join(userDataPath, '.wwebjs_cache');
            if (fs.existsSync(cacheFolder)) {
                try {
                    fs.rmSync(cacheFolder, { recursive: true, force: true });
                    console.log('Cache folder deleted successfully');
                } catch (fsErr) {
                    console.error('Error deleting cache folder:', fsErr);
                }
            }

            // Clear WhatsAppBot folder - this might contain additional session data
            const wwFolder = path.join(userDataPath, 'WhatsAppBot');
            if (fs.existsSync(wwFolder)) {
                try {
                    fs.rmSync(wwFolder, { recursive: true, force: true });
                    console.log('WhatsAppBot folder deleted successfully');
                } catch (fsErr) {
                    console.error('Error deleting WhatsAppBot folder:', fsErr);
                }
            }

            // Clear any session files in the userData directory
            const sessionFiles = fs.readdirSync(userDataPath).filter(file =>
                file.includes('whatsapp') || file.includes('puppeteer') || file.includes('session')
            );

            for (const file of sessionFiles) {
                try {
                    fs.rmSync(path.join(userDataPath, file), { recursive: true, force: true });
                    console.log(`Deleted session file: ${file}`);
                } catch (error) {
                    console.error(`Error deleting session file ${file}:`, error);
                }
            }

            // Clear media folder
            clearMediaFolder();
            mediaData.length = 0;

            // Send disconnected status to renderer
            mainWindow.webContents.send('connection-status', { status: 'disconnected' });

            // Wait a bit longer before reinitializing to ensure all cleanup is complete
            setTimeout(() => {
                try {
                    // Create a fresh directory for the new client
                    const whatsAppUserDataPath = path.join(userDataPath, 'WhatsAppBot');
                    if (!fs.existsSync(whatsAppUserDataPath)) {
                        fs.mkdirSync(whatsAppUserDataPath, { recursive: true });
                    }

                    // Recreate the client with the userDataPath
                    client = createWhatsAppClient(whatsAppUserDataPath);

                    // Register events
                    registerClientEvents(client, mainWindow, db);

                    // Initialize the new client
                    client.initialize().catch(err => {
                        console.error('Failed to initialize new client after logout', err);
                    });

                    console.log('WhatsApp client reinitialized after logout');
                } catch (error) {
                    console.error('Error reinitializing client after logout:', error);
                }
            }, 3000); // Increased timeout to ensure cleanup is complete

            return { success: true };
        } catch (err) {
            console.error('Logout error:', err);
            return { success: false, error: err.message };
        }
    })
    ipcMain.handle('get-existing-media', async () => {
        try {
            // Load media data
            loadMediaData();
            // Return the loaded data
            return { success: true, mediaData: getMediaData() };
        } catch (error) {
            console.error('Error getting existing media:', error);
            return { success: false, error: error.message };
        }
    });

    // Send media to a specific number
    ipcMain.handle('send-media-to-number', async (_e, { number, mediaItems }) => {
        try {
            if (!client || !client.info) {
                return { success: false, error: 'WhatsApp client not connected' }
            }

            const processedMedia = await processMediaFiles(mediaItems)
            const phoneNumber = `${number}@c.us`

            // Add random delay to avoid spam detection
            await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 1000))

            // Send each media item in order
            for (const item of processedMedia) {
                try {
                    if (item.type === 'message') {
                        await client.sendMessage(phoneNumber, item.content)
                    } else if (item.type === 'media') {
                        const media = await MessageMedia.fromFilePath(item.filePath)

                        if (item.caption) {
                            await client.sendMessage(phoneNumber, media, { caption: item.caption })
                        } else {
                            await client.sendMessage(phoneNumber, media)
                        }

                        // Clean up temporary file
                        if (fs.existsSync(item.filePath)) {
                            fs.unlinkSync(item.filePath)
                        }
                    }

                    // Small delay between messages
                    await new Promise(resolve => setTimeout(resolve, 500))
                } catch (itemError) {
                    console.error(`Error sending item to ${number}:`, itemError)
                    // Continue with next item even if one fails
                }
            }

            return { success: true }
        } catch (error) {
            console.error('Error in send-media-to-number:', error)
            return { success: false, error: error.message }
        }
    })




    ipcMain.handle('save-phone-numbers', async (_e, numbers) => {
        return savePhoneNumbers(numbers, db)
    })

    ipcMain.handle('getPhoneNumbers', async (_e, { page, limit, ...filters }) => {
        return getPhoneNumbers(page, limit, db, filters)
    })
    // Reset Database
    ipcMain.handle("resetPhoneNumbers", async (_e,) => {
        try {
            await resetHourlyStats(db)
            await resetStats(db)
            await resetPhoneNumbers(db)
            await clearMediaFolder();
            mediaData.length = 0;
            console.log('Phone numbers reset successfully')
            return { success: true }
        } catch (error) {
            return { success: false, error: error.message }
        }

    })
    // Reset Phone Number By ID
    ipcMain.handle("resetPhoneNumberById", async (_e, id) => {
        return resetPhoneNumberById(db, id);
    })

    // Add connection status handler
    ipcMain.handle('check-connection', async () => {
        try {
            if (client && client.info && client.info.wid) {
                return { connected: true }
            }
        } catch (err) {
            console.error('check-connection failed:', err)
        }
        return { connected: false }
    })

    // NEW BULK SENDING HANDLERS
    ipcMain.handle('start-bulk-sending', async (_e, { numbers, mediaData }) => {
        try {
            if (!client || !client.info || !client.info.wid) {
                return { success: false, error: 'WhatsApp client not connected' };
            }

            // Store data in memory
            bulkSendingData = {
                numbers: numbers,
                mediaData: mediaData.sort((a, b) => a.order - b.order), // Sort by order
                currentIndex: 0,
                isSending: true
            };

            console.log('Bulk sending started:', {
                numbersCount: numbers.length,
                mediaCount: mediaData.length
            });

            // Start processing
            await processBulkSending(client, mainWindow, bulkSendingData);

            return { success: true };
        } catch (error) {
            console.error('Error starting bulk sending:', error);
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('stop-bulk-sending', async () => {
        try {
            bulkSendingData.isSending = false;
            console.log('Bulk sending stopped');
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    });


    // In your main process
    ipcMain.handle('get-hourly-stats', (_e, hours) => {
        return getHourlyStats(hours, db);
    });
    ipcMain.handle('get-daily-stats', (_e, days) => {
        return getDailyStats(db, days);  // Fixed parameter order: db first, then days
    });
    // Handle Auth
    // In main process setup
    // Bot Settings
    ipcMain.handle('get-bot-status', async () => {
        try {
            const status = getBotStatus(db);
            return { success: true, enabled: status };
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('set-bot-status', async (_e, enabled) => {
        try {
            const result = setBotStatus(db, enabled);
            if (result.success) {
                // Notify renderer about the change
                mainWindow.webContents.send('bot-status-changed', enabled);
                return { success: true, enabled };
            }
            return result;
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    // Setup Auto Updater
    // ADD THESE AUTO-UPDATER HANDLERS
    ipcMain.handle('check-for-updates', async () => {
        try {
            const result = await autoUpdater.checkForUpdates()
            return { success: true, updateInfo: result?.updateInfo }
        } catch (error) {
            console.error('Error checking for updates:', error)
            return { success: false, error: error.message }
        }
    })

    ipcMain.handle('download-update', async () => {
        try {
            await autoUpdater.downloadUpdate()
            return { success: true }
        } catch (error) {
            console.error('Error downloading update:', error)
            return { success: false, error: error.message }
        }
    })

    ipcMain.handle('quit-and-install', async () => {
        try {
            autoUpdater.quitAndInstall(false, true)
            return { success: true }
        } catch (error) {
            console.error('Error installing update:', error)
            return { success: false, error: error.message }
        }
    })

}

