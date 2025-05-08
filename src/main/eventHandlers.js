import qrcode from 'qrcode'
import { MessageMedia } from 'whatsapp-web.js'
import { savePhoneNumber } from '../helpers/SavePhoneNumbers'
import { checkNumberExists } from '../helpers/checkPhone'
import logger from './logger'
import { getMediaData } from '../helpers/loadMedia'
import { recordMessage } from '../helpers/CountMessages'
import { incrementConversionCount, incrementTotalMessages, getDailyStats } from "../helpers/StatsHelpers"

export function registerClientEvents(client, mainWindow, db) {
    const mediaData = getMediaData()
    const userLocks = new Set()
    
    // Keep a local message count to avoid synchronization issues
    let localMessageCount = 0

    console.log('Media data loaded:', mediaData)

    // Initialize the local message count from the renderer at startup
    mainWindow.webContents.send('get-initial-count')
    mainWindow.webContents.once('initial-count-reply', (_e, count) => {
        localMessageCount = parseInt(count || '0')
        console.log('Initial message count loaded:', localMessageCount)
    })

    client.on('qr', qr => {
        console.log('QR received')
        qrcode.toDataURL(qr)
            .then(data => {
                mainWindow.webContents.send('qr', data)
            })
            .catch(err => console.error('QR generation error:', err))
    })

    client.on('message', async msg => {
        const MESSAGE_LIMIT = 5;
        // Save New Message Count
        const hour = new Date().getHours() + 'H';
        await recordMessage(hour, db);
        mainWindow.webContents.send('new-message', hour);
        const sender = msg.from
        const number = sender.split('@')[0]
        console.log(`Received message from ${sender} (${number})`)

        incrementTotalMessages(db);

        if (userLocks.has(sender)) {
            console.log(`Sender ${sender} is currently locked.`)
            return
        }
        userLocks.add(sender)
        console.log(`Lock added for ${sender}`)

        try {
            // Check if number exists in DB
            if (checkNumberExists(number, db)) {
                console.log(`Number ${number} already exists. Skipping...`)
                incrementConversionCount(db);
                return
            }

            // If it's a new number, increment the message count
            localMessageCount++
            console.log('Updated message count:', localMessageCount)
            
            // Send the updated count to the renderer
            mainWindow.webContents.send('update-message-count', localMessageCount)
            
            // Check if limit reached
            if (localMessageCount >= MESSAGE_LIMIT) {
                console.log('Message limit reached.')
                mainWindow.webContents.send('message-limit-reached')
                if(client.initialized) {
                    await client.logout()
                    console.log('Client logged out')
                }
                return
            }

            await new Promise(resolve => setTimeout(resolve, Math.random() * 15000 + 20000));
            for (const item of mediaData) {
                console.log(`Sending item to ${number}:`, item)
                if (item.type === 'message') {
                    await client.sendMessage(sender, item.content)
                }
                else {
                    // Skip files that are caption files
                    if (item.filePath && item.filePath.endsWith('.caption')) {
                        continue;
                    }

                    const media = await MessageMedia.fromFilePath(item.filePath)
                    // Check if there's a caption to send with the media
                    if (item.caption) {
                        await client.sendMessage(sender, media, { caption: item.caption })
                    } else {
                        await client.sendMessage(sender, media)
                    }
                }
            }

            savePhoneNumber(number, db)
            console.log(`Number ${number} saved to DB`)
        } catch (error) {
            logger.error('Error sending media:', error)
            console.error('Error in message handler:', error)
        } finally {
            userLocks.delete(sender)
            console.log(`Lock removed for ${sender}`)
        }
    })

    client.on('authenticated', () => {
        console.log('WhatsApp authenticated')
        mainWindow.webContents.send('authenticated', true)
        mainWindow.webContents.send('connection-status', { status: 'connected' })
    })

    client.on('ready', () => {
        console.log('WhatsApp client is ready')
        mainWindow.webContents.send('ready', true)
        mainWindow.webContents.send('connection-status', { status: 'connected' })
    })

    client.on('disconnected', reason => {
        console.log('Client was logged out:', reason)
        client.destroy()
        client.initialize()
        mainWindow.webContents.send('connection-status', { status: 'disconnected' })
    })

    client.on('auth_failure', err => {
        console.error('Authentication failure:', err.message)
        mainWindow.webContents.send('whatsapp-error', err.message)
    })
}