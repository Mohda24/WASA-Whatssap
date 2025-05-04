import fs from 'fs'
import path from 'path'
import { mediaBase } from '../helpers/folderSetup'

const mediaData = []

export function getMediaData() {
    return mediaData
}

export function loadMediaData() {
    try {
        const files = fs
            .readdirSync(mediaBase)
            .filter(file => file.match(/^\d{3}_/))
            .sort()

        // Clear and update the cache array
        mediaData.length = 0

        for (const file of files) {
            const filePath = path.join(mediaBase, file)
            const isMessage = file.endsWith('.txt')
            const fileName = file.split('_').slice(1).join('_')
            
            // Determine file type based on extension
            let fileType = 'media'
            if (isMessage) {
                fileType = 'message'
            } else if (/\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(fileName)) {
                fileType = 'image'
            } else if (/\.(mp3|wav|ogg|opus|m4a|flac)$/i.test(fileName)) {
                fileType = 'audio'
            } else if (/\.(mp4|webm|mov|avi|mkv|flv)$/i.test(fileName)) {
                fileType = 'video'
            } else if (/\.(pdf|doc|docx|xls|xlsx|txt)$/i.test(fileName)) {
                fileType = 'document'
            }

            // Check for caption file
            let caption = null;
            const captionFilePath = filePath + '.caption';
            if (fs.existsSync(captionFilePath)) {
                caption = fs.readFileSync(captionFilePath, 'utf8');
            }

            mediaData.push({
                order: file.split('_')[0],
                type: fileType,
                ...(isMessage
                    ? { content: fs.readFileSync(filePath, 'utf8') }
                    : { filePath }),
                name: file,
                originalName: fileName,
                caption: caption
            })
        }

        console.log(`Media data loaded: ${mediaData.length} items`)
    } catch (err) {
        console.error('Error loading media data:', err)
    }
}
