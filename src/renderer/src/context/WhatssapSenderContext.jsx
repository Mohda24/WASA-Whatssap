import React from 'react';
import { createContext, useContext, useState, useCallback } from'react';

import { arrayMove } from '@dnd-kit/sortable';



const WhatsAppSenderContext = createContext();

export const WhatsAppSenderProvider = ({ children}) => {
    const [numbers, setNumbers] = useState([]);
    const [mediaItems, setMediaItems] = useState([]);
    const [isSending, setIsSending] = useState(false);
    const [progress, setProgress] = useState({ sent: 0, total: 0 });
    const [activeMediaType, setActiveMediaType] = useState(null);
    const [manualNumbers, setManualNumbers] = useState('');

    const addNumbers = useCallback((newNumbers) => {
        const formattedNumbers = newNumbers.map((num, index) => ({
            id: Date.now() + index,
            number: num.toString().replace(/\D/g, ''),
            status: 'Not Yet'
        }));
        setNumbers(prev => [...prev, ...formattedNumbers]);
        setProgress(prev => ({ ...prev, total: prev.total + formattedNumbers.length }));
    }, []);

    const removeNumber = useCallback((id) => {
        setNumbers(prev => prev.filter(num => num.id !== id));
        setProgress(prev => ({ ...prev, total: prev.total - 1 }));
    }, []);

    const updateNumberStatus = useCallback((id, status) => {
        setNumbers(prev => prev.map(num =>
            num.id === id ? { ...num, status } : num
        ));
        if (status === 'Success' || status === 'Failed') {
            setProgress(prev => ({ ...prev, sent: prev.sent + 1 }));
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

    const startSending = useCallback(() => {
        setIsSending(true);
        setProgress({ sent: 0, total: numbers.length });
        // Simulate sending process
        numbers.forEach((num, index) => {
            setTimeout(() => {
                updateNumberStatus(num.id, 'Sending');
                setTimeout(() => {
                    updateNumberStatus(num.id, Math.random() > 0.1 ? 'Success' : 'Failed');
                }, 2000 + Math.random() * 3000);
            }, index * 1000);
        });
    }, [numbers, updateNumberStatus]);

    const stopSending = useCallback(() => {
        setIsSending(false);
    }, []);

    const resetAll = useCallback(() => {
        setNumbers([]);
        setMediaItems([]);
        setProgress({ sent: 0, total: 0 });
        setIsSending(false);
        setManualNumbers('');
    }, []);

    const value = {
        numbers,
        mediaItems,
        isSending,
        progress,
        activeMediaType,
        manualNumbers,
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
        setManualNumbers
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