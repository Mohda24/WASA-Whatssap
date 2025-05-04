import { Client, LocalAuth } from 'whatsapp-web.js'
import logger from './logger'
import fs from 'fs'
import path from 'path'
import { is } from '@electron-toolkit/utils'
import { findChromeExecutable } from '../helpers/findChromeExectuble'

export function createWhatsAppClient(userDataPath) {
    if (!fs.existsSync(userDataPath)) {
        fs.mkdirSync(userDataPath, { recursive: true })
    }

    const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'

    return new Client({
        authStrategy: new LocalAuth({ 
            dataPath: userDataPath,
        }),
        puppeteer: {
            headless: true,
            executablePath: is.dev
                ? chromePath
                : findChromeExecutable(),
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu',
                '--no-first-run',
                '--disable-web-security',
                '--disable-background-timer-throttling',  // Add this line
                '--disable-backgrounding-occluded-windows', // Add this line
                '--disable-renderer-backgrounding',  // Add this line
                `--user-data-dir=${userDataPath}`
            ],
            logger: {
                isEnabled: () => true,
                log: (severity, message) => logger.info(`Puppeteer [${severity}]: ${message}`)
            }
        },
        qrMaxRetries: 3, // Increase retries
        authTimeoutMs: 60000,
        restartOnAuthFail: true,
        takeoverOnConflict: true
    })
}
