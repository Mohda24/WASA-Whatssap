import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('api', {
  receive: (channel, func) => {
    const validChannels = ['qr', 'ready', 'authenticated', 'whatsapp-error', 'connection-status','new-message']
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, (_, ...args) => func(...args))
    }
  },
  removeListener: (channel, func) => {
    const validChannels = ['qr', 'ready', 'authenticated', 'whatsapp-error', 'connection-status', 'new-message']
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
  // Add to your existing contextBridge.exposeInMainWorld
  logoutWhatsApp: () => ipcRenderer.invoke('logout-whatsapp'),
  getHourlyStats: (hours) => ipcRenderer.invoke('get-hourly-stats', hours),
  getDailyStats: (days) => ipcRenderer.invoke('get-daily-stats', days)
  
  
})
