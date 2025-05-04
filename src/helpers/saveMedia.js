import fs from 'fs'
import path from 'path'

const mediaBase = path.join(__dirname, 'media')
const folders = ['Image', 'audio', 'messages']

// Ensure all media folders exist
folders.forEach(folder => {
    const dir = path.join(mediaBase, folder)
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
    }
})

export function saveFile(fileBuffer, fileName, type) {
    const folderMap = {
        image: 'Image',
        audio: 'audio',
        message: 'messages'
    }

    const folder = folderMap[type]
    if (!folder) throw new Error(`Invalid media type: ${type}`)

    const filePath = path.join(mediaBase, folder, fileName)
    fs.writeFileSync(filePath, fileBuffer)
    return filePath
}
