import { validatePhoneNumbers } from './validatePhoneNumbers';
import { MessageMedia } from 'whatsapp-web.js'
import { checkClientStatus } from './checkClientStatu';
import { convertMp3ToOpusInMemory } from './ConvertMp3ToOpusInMemory';// Import your converter

export async function processBulkSending(client, mainWindow, bulkSendingData) {
    console.log('Starting bulk sending process...');
    
    // Check if client is ready before starting
    const clientStatus = checkClientStatus(client);
    if (!clientStatus.ready) {
        console.error('WhatsApp client is not ready:', clientStatus.error);
        mainWindow.webContents.send('bulk-sending-error', clientStatus.error);
        return;
    }

    // Validate phone numbers before starting bulk send
    console.log('Validating phone numbers...');
    const { validNumbers, invalidNumbers } = await validatePhoneNumbers(client, bulkSendingData.numbers);
    
    // Update UI with invalid numbers
    if (invalidNumbers.length > 0) {
        console.log(`Found ${invalidNumbers.length} invalid numbers`);
        invalidNumbers.forEach(number => {
            console.log(`Updating invalid number ${number.id} with error: ${number.error}`);
            mainWindow.webContents.send('number-status-update', {
                id: number.id,
                status: `Failed - ${number.error}`
            });
        });
    }
    
    // Update bulk sending data with only valid numbers
    bulkSendingData.numbers = validNumbers;
    
    if (validNumbers.length === 0) {
        console.log('No valid numbers to send to');
        mainWindow.webContents.send('bulk-sending-complete');
        return;
    }
    
    console.log(`Starting to send to ${validNumbers.length} valid numbers`);
    
    // Process each number
    while (bulkSendingData.isSending && bulkSendingData.currentIndex < bulkSendingData.numbers.length) {
        const currentNumber = bulkSendingData.numbers[bulkSendingData.currentIndex];
        
        // Use the pre-validated phone number
        const phoneNumber = currentNumber.validatedNumber;
        
        try {
            console.log(`Processing number ${currentNumber.number} (${bulkSendingData.currentIndex + 1}/${bulkSendingData.numbers.length})`);
            
            // Update status to sending
            console.log(`Updating status to 'Sending' for number ID: ${currentNumber.id}`);
            mainWindow.webContents.send('number-status-update', {
                id: currentNumber.id,
                status: 'Sending'
            });

            // Add delay before sending (increased for better reliability)
            console.log('Waiting before sending...');
            await new Promise(resolve => setTimeout(resolve, Math.random() * 3000 + 2000));

            // Check if client is still connected before each send
            const currentClientStatus = checkClientStatus(client);
            if (!currentClientStatus.ready) {
                throw new Error(`WhatsApp client issue: ${currentClientStatus.error}`);
            }

            // Send all media items in order
            console.log(`Sending ${bulkSendingData.mediaData.length} media items to ${currentNumber.number}`);
            for (let i = 0; i < bulkSendingData.mediaData.length; i++) {
                const mediaItem = bulkSendingData.mediaData[i];
                
                if (!bulkSendingData.isSending) {
                    console.log('Bulk sending stopped by user');
                    break;
                }

                try {
                    console.log(`Sending media item ${i + 1}/${bulkSendingData.mediaData.length} of type: ${mediaItem.type}`);
                    
                    if (mediaItem.type === 'text') {
                        await client.sendMessage(phoneNumber, mediaItem.content);
                        console.log('Text message sent successfully');
                    } else {
                        // Validate media data
                        if (!mediaItem.data || !mediaItem.mimeType) {
                            console.error('Invalid media data:', mediaItem);
                            continue;
                        }

                        console.log("Processing media:", {
                            type: mediaItem.type,
                            mimeType: mediaItem.mimeType,
                            name: mediaItem.name,
                            hasCaption: !!mediaItem.caption
                        });
                        
                        // Convert base64 back to buffer
                        const base64Data = mediaItem.data.includes(',') 
                            ? mediaItem.data.split(',')[1] 
                            : mediaItem.data;
                        
                        let finalMediaData = base64Data;
                        let finalMimeType = mediaItem.mimeType;
                        let finalName = mediaItem.name;

                        // Handle MP3 to Opus conversion for audio files
                        if (mediaItem.type === 'audio' && mediaItem.mimeType === 'audio/mpeg') {
                            try {
                                console.log('Converting MP3 to Opus for WhatsApp compatibility...');
                                
                                // Convert base64 to buffer
                                const mp3Buffer = Buffer.from(base64Data, 'base64');
                                
                                // Convert MP3 to Opus in memory
                                const opusBuffer = await convertMp3ToOpusInMemory(mp3Buffer);
                                
                                // Convert back to base64
                                finalMediaData = opusBuffer.toString('base64');
                                finalMimeType = 'audio/opus';
                                
                                // Update filename extension
                                if (finalName.endsWith('.mp3')) {
                                    finalName = finalName.replace('.mp3', '.opus');
                                } else if (!finalName.includes('.')) {
                                    finalName += '.opus';
                                }
                                
                                console.log('Successfully converted MP3 to Opus');
                            } catch (conversionError) {
                                console.error('Failed to convert MP3 to Opus:', conversionError);
                                // Continue with original MP3 file if conversion fails
                                console.log('Continuing with original MP3 file');
                            }
                        }
                        
                        const media = new MessageMedia(finalMimeType, finalMediaData, finalName);
                        
                        // Validate media before sending
                        if (!media.data || !media.mimetype) {
                            throw new Error('Invalid media object created');
                        }
                        
                        if (mediaItem.caption) {
                            await client.sendMessage(phoneNumber, media, { 
                                caption: mediaItem.caption,
                                sendMediaAsDocument: mediaItem.type === 'document'
                            });
                        } else {
                            await client.sendMessage(phoneNumber, media, {
                                sendMediaAsDocument: mediaItem.type === 'document'
                            });
                        }
                        
                        console.log(`Media item ${i + 1} sent successfully`);
                    }
                    
                    // Small delay between media items
                    if (i < bulkSendingData.mediaData.length - 1) {
                        await new Promise(resolve => setTimeout(resolve, 1500));
                    }
                    
                } catch (mediaError) {
                    console.error(`Error sending media item ${i + 1}:`, mediaError);
                    // Continue with next media item instead of failing completely
                }
            }

            // Update status to success
            console.log(`Successfully sent all media to ${currentNumber.number}, updating status to 'Success'`);
            mainWindow.webContents.send('number-status-update', {
                id: currentNumber.id,
                status: 'Success'
            });

        } catch (error) {
            console.error(`Error sending to ${currentNumber.number}:`, error);
            
            // Determine error type for better user feedback
            let errorStatus = 'Failed';
            if (error.message.includes('disconnected')) {
                errorStatus = 'Failed - Disconnected';
                // Stop bulk sending if disconnected
                bulkSendingData.isSending = false;
                mainWindow.webContents.send('bulk-sending-error', 'WhatsApp disconnected');
            } else if (error.message.includes('Rate limit')) {
                errorStatus = 'Failed - Rate Limited';
                // Add longer delay for rate limiting
                console.log('Rate limit detected, waiting 60 seconds...');
                await new Promise(resolve => setTimeout(resolve, 60000)); // 1 minute delay
            } else if (error.message.includes('serialize')) {
                errorStatus = 'Failed - Session Error';
                // Try to reconnect or restart session
                console.log('Session error detected, may need to restart WhatsApp client');
            }
            
            // Update status to failed with specific error
            console.log(`Updating status to '${errorStatus}' for number ID: ${currentNumber.id}`);
            mainWindow.webContents.send('number-status-update', {
                id: currentNumber.id,
                status: errorStatus
            });
        }

        // Move to next number
        bulkSendingData.currentIndex++;
        
        // Add delay between numbers (increased for better reliability)
        if (bulkSendingData.isSending && bulkSendingData.currentIndex < bulkSendingData.numbers.length) {
            console.log('Waiting before processing next number...');
            await new Promise(resolve => setTimeout(resolve, Math.random() * 5000 + 3000));
        }
    }

    // Send completion signal
    if (bulkSendingData.currentIndex >= bulkSendingData.numbers.length) {
        console.log('All numbers processed, sending completion signal');
        mainWindow.webContents.send('bulk-sending-complete');
        console.log('Bulk sending completed');
    } else if (!bulkSendingData.isSending) {
        console.log('Bulk sending stopped by user');
        mainWindow.webContents.send('bulk-sending-complete');
    }

    // Reset bulk sending data
    bulkSendingData.numbers = [];
    bulkSendingData.mediaData = [];
    bulkSendingData.currentIndex = 0;
    bulkSendingData.isSending = false;
    
    console.log('Bulk sending process finished');
}