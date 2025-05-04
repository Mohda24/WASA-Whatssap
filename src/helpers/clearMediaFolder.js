const fs = require('fs')
const path = require('path')
import { mediaBase } from './folderSetup'

export function clearMediaFolder() {
    try {
        const files = fs.readdirSync(mediaBase)
            .filter(file => file.match(/^\d{3}_/) || file.endsWith('.caption'))

        for (const file of files) {
            const filePath = path.join(mediaBase, file)
            fs.rmSync(filePath, { force: true })
        }
        console.log('Media folder cleared successfully')
    } catch (error) {
        console.error('Error clearing media folder:', error)
    }
}