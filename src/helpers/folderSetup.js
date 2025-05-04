import path from 'path'
import fs from 'fs'
import { app } from 'electron'

export const mediaBase = path.join(app.getPath('userData'), 'media')

export function ensureMediaFoldersExist() {
    if (!fs.existsSync(mediaBase)) {
        fs.mkdirSync(mediaBase, { recursive: true })
    }


}