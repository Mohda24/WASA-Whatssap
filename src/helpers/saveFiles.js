import fs from 'fs'
import path from 'path'
import { mediaBase } from './folderSetup'
import { convertMp3ToOpus } from './convertmp3ToOpus'
import logger from '../main/logger'

export async function saveFiles(files) {
    // First, get all existing files in the media folder
    const existingFiles = fs.readdirSync(mediaBase);
    
    // Create a set of filenames we want to keep (without order prefix)
    const filesToKeep = new Set(files.map(file => file.name));
    
    // Delete files that are not in the new list
    for (const existingFile of existingFiles) {
        // Skip caption files, they'll be handled with their main files
        if (existingFile.endsWith('.caption')) continue;
        
        // Remove order prefix to get the base filename
        const baseFilename = existingFile.replace(/^\d+_/, '');
        
        // If this file is not in our new list, delete it and its caption
        if (!filesToKeep.has(baseFilename)) {
            const fullPath = path.join(mediaBase, existingFile);
            const captionPath = fullPath + '.caption';
            
            try {
                fs.unlinkSync(fullPath);
                logger.info(`Deleted old file: ${existingFile}`);
                
                // Delete caption file if it exists
                if (fs.existsSync(captionPath)) {
                    fs.unlinkSync(captionPath);
                    logger.info(`Deleted old caption file: ${existingFile}.caption`);
                }
            } catch (error) {
                logger.error(`Error deleting old file: ${existingFile}`, error);
            }
        }
    }

    // Now process the new files list
    for (const file of files) {
        console.log('Processing file:', file);
        if (file.existingFile && file.filePath) {
            // Look for files with any order prefix
            const files = fs.readdirSync(mediaBase);
            const existingFile = files.find(f => {
                // Remove any order prefix (like "001_", "002_" etc)
                const withoutPrefix = f.replace(/^\d+_/, '');
                return withoutPrefix === file.name;
            });
            
            if (existingFile) {
                const newName = `${file.order}_${file.name}`;
                const newPath = path.join(mediaBase, newName);
                const currentPath = path.join(mediaBase, existingFile);
                
                try {
                    fs.copyFileSync(currentPath, newPath);
                    // Delete the old file after successful copy
                    fs.unlinkSync(currentPath);
                    logger.info(`Successfully copied existing file to new location: ${newPath}`);
                    
                    // Handle caption if it exists
                    const oldCaptionPath = currentPath + '.caption';
                    if (file.caption || fs.existsSync(oldCaptionPath)) {
                        // Delete old caption
                        if (fs.existsSync(oldCaptionPath)) {
                            fs.unlinkSync(oldCaptionPath);
                        }
                        // Save new caption if provided
                        if (file.caption) {
                            fs.writeFileSync(newPath + '.caption', file.caption);
                            logger.info(`Saved caption for file: ${newPath}`);
                        }
                    }
                } catch (error) {
                    logger.error(`Failed to copy existing file: ${currentPath} to ${newPath}`, error);
                    continue;
                }
            } else {
                logger.error(`Cannot save file: ${file.name} - source file not found in media folder`);
                console.log('Files in media folder:', fs.readdirSync(mediaBase));
            }
            continue;
        }

        // Otherwise process as before
        const { name, buffer, type, order, caption, content } = file;
        const filename = type === 'message' ? `${name}.txt` : name;
        const savePath = path.join(mediaBase, `${order}_${filename}`);

        if (type !== 'audio') {
            try {
                // For message type, use content instead of buffer
                if (type === 'message') {
                    fs.writeFileSync(savePath, content);
                } else {
                    fs.writeFileSync(savePath, Buffer.from(buffer));
                }
                logger.info(`Successfully saved file: ${filename} of type: ${type}`);
                
                // Save caption if it exists
                if (caption) {
                    fs.writeFileSync(savePath + '.caption', caption);
                    logger.info(`Saved caption for file: ${filename}`);
                }
            } catch (error) {
                logger.error(`Failed to save file: ${filename} of type: ${type}`, error);
                // Continue processing other files
                continue;
            }
        } else {
            const inputPath = savePath;
            const opusOutputPath = inputPath.replace('.mp3', '.opus');

            try {
                fs.writeFileSync(inputPath, Buffer.from(buffer));
                logger.info(`Successfully saved MP3 file: ${filename}`);
                
                await convertMp3ToOpus(inputPath, opusOutputPath);
                fs.unlinkSync(inputPath); // remove .mp3
                logger.info(`Successfully converted MP3 to Opus: ${opusOutputPath}`);
            } catch (error) {
                logger.error(`Error processing audio file: ${filename}`, error);
                // Continue processing other files
                continue;
            }
            
            // Save caption if it exists (for audio files)
            if (caption) {
                const opusOutputPath = inputPath.replace('.mp3', '.opus');
                fs.writeFileSync(opusOutputPath + '.caption', caption);
                logger.info(`Saved caption for audio file: ${filename}`);
            }
        }
    }
}
