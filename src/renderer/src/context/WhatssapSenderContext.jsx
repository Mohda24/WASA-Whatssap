import React from 'react';
import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { arrayMove } from '@dnd-kit/sortable';

const WhatsAppSenderContext = createContext();

export const WhatsAppSenderProvider = ({ children }) => {
    const [numbers, setNumbers] = useState([]);
    const [mediaItems, setMediaItems] = useState([]);
    const [isSending, setIsSending] = useState(false);
    const [progress, setProgress] = useState({ sent: 0, total: 0 });
    const [activeMediaType, setActiveMediaType] = useState(null);
    const [manualNumbers, setManualNumbers] = useState('');
    const [currentSendingId, setCurrentSendingId] = useState(null);

    // Event listeners for IPC communication
    useEffect(() => {
        const handleNumberStatusUpdate = (data) => {
            console.log('Received status update:', data);
            updateNumberStatus(data.id, data.status);
        };

        const handleBulkSendingComplete = () => {
            console.log('Bulk sending completed');
            setIsSending(false);
            setCurrentSendingId(null);
        };

        const handleBulkSendingError = (error) => {
            console.error('Bulk sending error:', error);
            setIsSending(false);
            setCurrentSendingId(null);
            alert(`Bulk sending error: ${error}`);
        };

        // Add event listeners
        if (window.api) {
            window.api.receive('number-status-update', handleNumberStatusUpdate);
            window.api.receive('bulk-sending-complete', handleBulkSendingComplete);
            window.api.receive('bulk-sending-error', handleBulkSendingError);
        }

        // Cleanup function
        return () => {
            if (window.api) {
                window.api.removeListener('number-status-update', handleNumberStatusUpdate);
                window.api.removeListener('bulk-sending-complete', handleBulkSendingComplete);
                window.api.removeListener('bulk-sending-error', handleBulkSendingError);
            }
        };
    }, []); // Empty dependency array to run only once

    const addNumbers = useCallback((newNumbers) => {
        const formattedNumbers = newNumbers.map((num, index) => ({
            id: Date.now() + index,
            number: num.toString().replace(/\D/g, ''),
            status: 'Pending'
        }));
        
        // Filter out duplicates
        setNumbers(prev => {
            const existingNumbers = new Set(prev.map(n => n.number));
            const uniqueNumbers = formattedNumbers.filter(n => !existingNumbers.has(n.number));
            return [...prev, ...uniqueNumbers];
        });
        
        setProgress(prev => ({ 
            ...prev, 
            total: prev.total + formattedNumbers.filter(n => 
                !numbers.some(existing => existing.number === n.number)
            ).length 
        }));
    }, [numbers]);

    const removeNumber = useCallback((id) => {
        setNumbers(prev => prev.filter(num => num.id !== id));
        setProgress(prev => ({ ...prev, total: Math.max(0, prev.total - 1) }));
    }, []);

    const updateNumberStatus = useCallback((id, status) => {
        console.log('Updating number status:', { id, status });
        
        setNumbers(prev => {
            const updated = prev.map(num => {
                if (num.id === id) {
                    console.log(`Updating number ${num.number} from ${num.status} to ${status}`);
                    return { ...num, status };
                }
                return num;
            });
            return updated;
        });

        // Update progress counter for completed sends
        if (status === 'Success' || status.startsWith('Failed')) {
            setProgress(prev => ({ 
                ...prev, 
                sent: prev.sent + 1 
            }));
        }
    }, []);

    const addMediaItem = useCallback((item) => {
        const newItem = {
            id: Date.now(),
            ...item,
            order: mediaItems.length
        };
        setMediaItems(prev => [...prev, newItem]);
        setActiveMediaType(null);
    }, [mediaItems.length]);

    const removeMediaItem = useCallback((id) => {
        setMediaItems(prev => prev.filter(item => item.id !== id));
    }, []);

    const reorderMediaItems = useCallback((activeId, overId) => {
        setMediaItems(prev => {
            const oldIndex = prev.findIndex(item => item.id === activeId);
            const newIndex = prev.findIndex(item => item.id === overId);
            return arrayMove(prev, oldIndex, newIndex);
        });
    }, []);

    // Convert media items to the format expected by the backend
    const convertMediaForBackend = useCallback((mediaItems) => {
        return mediaItems.map((item, index) => ({
            id: item.id,
            type: item.type,
            order: index,
            content: item.type === 'text' ? item.content : undefined,
            name: item.name || `media_${index}`,
            caption: item.caption || '',
            data: item.data, // Base64 data
            mimeType: item.mimeType || 'application/octet-stream',
            size: item.size || 0
        }));
    }, []);

    const startSending = useCallback(async () => {
        if (numbers.length === 0 || mediaItems.length === 0) {
            alert('Please add numbers and media items before sending');
            return;
        }

        try {
            setIsSending(true);
            setProgress({ sent: 0, total: numbers.length });
            
            // Reset all number statuses to Pending
            setNumbers(prev => prev.map(num => ({ ...num, status: 'Pending' })));

            // Convert media items to backend format
            const mediaData = convertMediaForBackend(mediaItems);

            console.log('Starting bulk sending with:', {
                numbersCount: numbers.length,
                mediaCount: mediaData.length
            });

            // Start bulk sending via IPC
            const result = await window.api.startBulkSending({
                numbers: numbers,
                mediaData: mediaData
            });

            if (!result.success) {
                throw new Error(result.error || 'Failed to start bulk sending');
            }

            console.log('Bulk sending started successfully');
        } catch (error) {
            console.error('Error starting bulk sending:', error);
            setIsSending(false);
            alert(`Error starting bulk sending: ${error.message}`);
        }
    }, [numbers, mediaItems, convertMediaForBackend]);

    const stopSending = useCallback(async () => {
        try {
            const result = await window.api.stopBulkSending();
            console.log('Stopping bulk sending...', result);
            
            if (result.success) {
                setIsSending(false);
                setCurrentSendingId(null);
                
                // Update any "Sending" status to "Cancelled"
                setNumbers(prev => prev.map(num =>
                    num.status === 'Sending' ? { ...num, status: 'Cancelled' } : num
                ));
                
                console.log('Bulk sending stopped');
            }
        } catch (error) {
            console.error('Error stopping bulk sending:', error);
        }
    }, []);

    const resetAll = useCallback(async () => {
        try {
            // Stop sending if in progress
            if (isSending) {
                await stopSending();
            }

            // Reset local state
            setNumbers([]);
            setMediaItems([]);
            setProgress({ sent: 0, total: 0 });
            setManualNumbers('');
            setCurrentSendingId(null);
            setActiveMediaType(null);

            // Reset backend data if needed
            try {
                await window.api.resetPhoneNumbers();
            } catch (error) {
                console.error('Error resetting backend data:', error);
            }

            console.log('All data reset successfully');
        } catch (error) {
            console.error('Error resetting data:', error);
        }
    }, [isSending, stopSending]);

    const value = {
        numbers,
        mediaItems,
        isSending,
        progress,
        activeMediaType,
        manualNumbers,
        currentSendingId,
        
        addNumbers,
        removeNumber,
        updateNumberStatus,
        addMediaItem,
        removeMediaItem,
        reorderMediaItems,
        startSending,
        stopSending,
        resetAll,
        setActiveMediaType,
        setManualNumbers,
    };

    return (
        <WhatsAppSenderContext.Provider value={value}>
            {children}
        </WhatsAppSenderContext.Provider>
    );
};

export const useWhatsAppSender = () => {
    const context = useContext(WhatsAppSenderContext);
    if (!context) {
        throw new Error('useWhatsAppSender must be used within WhatsAppSenderProvider');
    }
    return context;
};