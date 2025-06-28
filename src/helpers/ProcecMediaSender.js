// Helper function to process files and convert to media data
    export const processMediaFiles = async (mediaItems) => {
        const processedMedia = []
        
        for (const item of mediaItems) {
            if (item.type === 'text') {
                processedMedia.push({
                    type: 'message',
                    content: item.content,
                    order: item.order
                })
            } else if (item.file) {
                // Save file temporarily and create media object
                const tempPath = path.join(app.getPath('temp'), `${Date.now()}_${item.name}`)
                
                // Convert File object to buffer (assuming it's from frontend)
                const buffer = Buffer.from(await item.file.arrayBuffer())
                fs.writeFileSync(tempPath, buffer)
                
                processedMedia.push({
                    type: 'media',
                    filePath: tempPath,
                    caption: item.caption,
                    mediaType: item.type,
                    order: item.order
                })
            }
        }
        
        return processedMedia.sort((a, b) => a.order - b.order)
    }