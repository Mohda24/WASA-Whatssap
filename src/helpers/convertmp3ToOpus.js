import ffmpeg from 'fluent-ffmpeg'
import path from 'path'
import logger from '../main/logger'

let ffmpegPath

if (process.env.NODE_ENV === 'development') {
    ffmpegPath = path.resolve(__dirname, '../../resources/ffmpeg/bin/ffmpeg.exe')
} else {
    // Fix for production path - use app.asar.unpacked
    ffmpegPath = path.join(process.resourcesPath, 'app.asar.unpacked', 'resources', 'ffmpeg', 'bin', 'ffmpeg.exe')
}

logger.info(`FFmpeg path configured: ${ffmpegPath}`)
ffmpeg.setFfmpegPath(ffmpegPath)

export function convertMp3ToOpus(inputPath, outputPath) {
    return new Promise((resolve, reject) => {
        logger.info(`Starting MP3 to Opus conversion: ${path.basename(inputPath)}`)
        
        ffmpeg(inputPath)
            .output(outputPath)
            .audioCodec('libopus')
            .on('end', () => {
                logger.info(`Successfully converted to Opus: ${path.basename(outputPath)}`)
                resolve(outputPath)
            })
            .on('error', (err) => {
                logger.error(`Failed to convert MP3 to Opus: ${path.basename(inputPath)}`, err)
                reject(err)
            })
            .run()
    })
}
