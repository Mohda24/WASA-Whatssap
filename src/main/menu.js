import { Menu, shell, powerSaveBlocker } from 'electron'
import logger from './logger'

export function createAppMenu(mainWindow) {
    let powerSaveId = powerSaveBlocker.start('prevent-display-sleep')
    
    const menu = Menu.buildFromTemplate([
        {
            label: 'Debug',
            submenu: [
                {
                    label: 'Open Logs',
                    click: () => shell.openPath(logger.getLogPath())
                },
                {
                    label: 'Open DevTools',
                    click: () => mainWindow.webContents.openDevTools()
                }
            ]
        },
        {
            label: 'Power',
            submenu: [
                {
                    label: 'Prevent Sleep',
                    type: 'checkbox',
                    checked: true,
                    click: (menuItem) => {
                        if (menuItem.checked) {
                            if (!powerSaveBlocker.isStarted(powerSaveId)) {
                                powerSaveId = powerSaveBlocker.start('prevent-display-sleep')
                                logger.info('Power save blocker enabled')
                            }
                        } else {
                            if (powerSaveBlocker.isStarted(powerSaveId)) {
                                powerSaveBlocker.stop(powerSaveId)
                                logger.info('Power save blocker disabled')
                            }
                        }
                    }
                }
            ]
        }
    ])
    Menu.setApplicationMenu(menu)
}