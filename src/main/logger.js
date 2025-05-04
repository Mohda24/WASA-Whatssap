import { app } from 'electron'
import path from 'path'
import fs from 'fs'

const logPath = path.join(app.getPath('userData'), 'logs')
if (!fs.existsSync(logPath)) {
  fs.mkdirSync(logPath, { recursive: true })
}

const logFile = path.join(logPath, 'whatsapp.log')

function log(level, message, error = null) {
  const timestamp = new Date().toISOString()
  const logMessage = `${timestamp} [${level}] ${message}\n`
  if (error) {
    const errorDetails = `${timestamp} [ERROR_DETAILS] ${error.stack || error}\n`
    fs.appendFileSync(logFile, errorDetails)
  }
  fs.appendFileSync(logFile, logMessage)
  console.log(message)
}

export const logger = {
  info: (message) => log('INFO', message),
  error: (message, error) => log('ERROR', message, error),
  warn: (message) => log('WARN', message),
  getLogPath: () => logFile
}

export default logger