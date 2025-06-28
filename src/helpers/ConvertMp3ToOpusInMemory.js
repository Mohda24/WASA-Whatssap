import logger from "../main/logger"
import ffmpeg from 'fluent-ffmpeg'
import { Readable, PassThrough } from 'stream'
export function convertMp3ToOpusInMemory(inputBuffer) {
    return new Promise((resolve, reject) => {
        logger.info(`Starting MP3 to Opus conversion in memory (${inputBuffer.length} bytes)`)
        
        // Create readable stream from buffer
        const inputStream = new Readable()
        inputStream.push(inputBuffer)
        inputStream.push(null) // End the stream
        
        // Create output stream to collect the converted data
        const outputStream = new PassThrough()
        const chunks = []
        
        outputStream.on('data', (chunk) => {
            chunks.push(chunk)
        })
        
        outputStream.on('end', () => {
            const outputBuffer = Buffer.concat(chunks)
            logger.info(`Successfully converted MP3 to Opus in memory (${outputBuffer.length} bytes)`)
            resolve(outputBuffer)
        })
        
        outputStream.on('error', (err) => {
            logger.error('Error in output stream during MP3 to Opus conversion', err)
            reject(err)
        })
        
        // Configure FFmpeg to read from stream and output to stream
        ffmpeg(inputStream)
            .inputFormat('mp3')
            .audioCodec('libopus')
            .format('opus')
            .on('end', () => {
                logger.info('FFmpeg conversion process completed')
            })
            .on('error', (err) => {
                logger.error('Failed to convert MP3 to Opus in memory', err)
                reject(err)
            })
            .pipe(outputStream)
    })
}