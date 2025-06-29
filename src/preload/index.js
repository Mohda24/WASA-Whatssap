import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('api', {
  receive: (channel, func) => {
    const validChannels = [
      'qr', 
      'ready', 
      'authenticated', 
      'whatsapp-error', 
      'connection-status',
      'new-message',
      'number-status-update',
      'bulk-sending-complete',
      'bulk-sending-error',// Added this missing channel
      'bot-status-changed'
    ]
    if (validChannels.includes(channel)) {
      // Remove existing listeners to prevent duplicates
      ipcRenderer.removeAllListeners(channel);
      ipcRenderer.on(channel, (_, ...args) => func(...args))
    }
  },
  
  removeListener: (channel, func) => {
    const validChannels = [
      'qr', 
      'ready', 
      'authenticated', 
      'whatsapp-error', 
      'connection-status', 
      'new-message',
      'number-status-update',
      'bulk-sending-complete',
      'bulk-sending-error'
    ]
    if (validChannels.includes(channel)) {
      ipcRenderer.removeListener(channel, func)
    }
  },

  // Add methods to check and manage connection status
  checkConnection: () => {
    return ipcRenderer.invoke('check-connection')
  },

  // Existing methods
  sendUpload: (data) => {
    return ipcRenderer.invoke('upload-files', data)
  },

  savePhoneNumbers: (numbers) => {
    return ipcRenderer.invoke('save-phone-numbers', numbers)
  },

  getPhoneNumbers: async (params) => {
    try {
        return await ipcRenderer.invoke('getPhoneNumbers', params)
    } catch (error) {
        console.error('Failed to get phone numbers:', error)
        return {
            numbers: [],
            total: 0
        }
    }
  },
  
  resetPhoneNumbers: () => {
    return ipcRenderer.invoke('resetPhoneNumbers')
  },
  
  resetPhoneNumberById: (id) => {
    return ipcRenderer.invoke('resetPhoneNumberById', id)
  },
  
  getExistingMedia: () => ipcRenderer.invoke('get-existing-media'),
  
  logoutWhatsApp: () => ipcRenderer.invoke('logout-whatsapp'),
  
  getHourlyStats: (hours) => ipcRenderer.invoke('get-hourly-stats', hours),
  
  getDailyStats: (days) => ipcRenderer.invoke('get-daily-stats', days),
  
  // BULK SENDING METHODS
  startBulkSending: (data) => ipcRenderer.invoke('start-bulk-sending', data),
  
  stopBulkSending: () => ipcRenderer.invoke('stop-bulk-sending'),

  // Bot status methods
    getBotStatus: () => ipcRenderer.invoke('get-bot-status'),
    setBotStatus: (enabled) => ipcRenderer.invoke('set-bot-status', enabled),
})