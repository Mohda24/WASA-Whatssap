import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';

const AppContext = createContext();

export function AppProvider({ children }) {
    const { t, i18n } = useTranslation();
    const [darkMode, setDarkMode] = useState(() => {
        const saved = localStorage.getItem('darkMode');
        return saved === 'true';
    });
    // Login Auth
    const [isLoggedIn, setIsLoggedIn] = useState(() => {
        const saved = localStorage.getItem('licenseKey');
        return saved ? true : false;
    });
    const [isRTL, setIsRTL] = useState(i18n.language === 'ar');

    // WhatsApp connection states
    const [isConnected, setIsConnected] = useState(false);
    const [qrCode, setQrCode] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Upload states
    const [uploadQueue, setUploadQueue] = useState([]);
    const [images, setImages] = useState([]);
    const [audios, setAudios] = useState([]);
    const [videos, setVideos] = useState([]);
    const [documents, setDocuments] = useState([]);
    const [messages, setMessages] = useState(['']);
    const [activeTab, setActiveTab] = useState('Images');


    // Phone number states
    const [numbers, setNumbers] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [numbersLoading, setNumbersLoading] = useState(true);
    const numbersPerPage = 100;

    // Excel data states
    const [excelData, setExcelData] = useState([]);
    const [manualNumber, setManualNumber] = useState('');
    const [selectedColumn, setSelectedColumn] = useState('');
    
    //Chart Messages
    const [chartData, setChartData] = useState(null); 
    // Bot status state
    const [botEnabled, setBotEnabled] = useState(true);
    const [botStatusLoading, setBotStatusLoading] = useState(true);




    // set Key
    const setKey = useCallback((key) => {
        localStorage.setItem('licenseKey', key);
        setIsLoggedIn(true);}, []);

    // Generate unique ID for queue items
    const generateId = (type) => {
        return `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    };

    // WhatsApp connection handlers
    const setupWhatsAppListeners = useCallback(() => {
        if (!window.api) return;

        const handleQr = (qr) => {
            setQrCode(qr);
            setIsConnected(false);
            setIsLoading(false);
        };

        const handleAuthenticated = () => {
            setIsConnected(true);
            setQrCode(null);
            setIsLoading(false);
            notify('notifications.success.connected');
        };

        const handleReady = () => {
            setIsConnected(true);
            setQrCode(null);
            setIsLoading(false);
            notify('notifications.success.connected');
        };

        const handleDisconnected = () => {
            setIsConnected(false);
            setIsLoading(false);
            notify('notifications.error.disconnected', 'error');
        };

        window.api.receive('qr', handleQr);
        window.api.receive('authenticated', handleAuthenticated);
        window.api.receive('ready', handleReady);
        window.api.receive('disconnected', handleDisconnected);

        // Initial connection check
        window.api.checkConnection()
            .then(status => {
                if (status?.connected) {
                    setIsConnected(true);
                    setQrCode(null);
                    setIsLoading(false);
                }
            })
            .catch(() => {
                setIsLoading(false);
            });

        return () => {
            if (window.api.removeListener) {
                window.api.removeListener('qr', handleQr);
                window.api.removeListener('authenticated', handleAuthenticated);
                window.api.removeListener('ready', handleReady);
                window.api.removeListener('disconnected', handleDisconnected);
            }
        };
    }, []);

    // Initialize WhatsApp connection
    useEffect(() => {
        const cleanup = setupWhatsAppListeners();
        return cleanup;
    }, [setupWhatsAppListeners]);

    // Fetch phone numbers
    const fetchNumbers = useCallback(async (page = 1, filters = {}) => {
        try {
            setNumbersLoading(true);
            const result = await window.api.getPhoneNumbers({
                page,
                limit: numbersPerPage,
                ...filters
            });

            setNumbers(result.numbers || []);
            setTotalPages(Math.ceil((result.total || 0) / numbersPerPage));
            setCurrentPage(page);
        } catch (error) {
            console.error('Failed to fetch numbers:', error);
            notify('notifications.error.numberFetchFailed', 'error');
        } finally {
            setNumbersLoading(false);
        }
    }, [numbersPerPage]);

    // Reset database
    const resetDatabase = useCallback(async () => {
        try {
            const result = await window.api.resetPhoneNumbers();
            console.log(result)
            if (result?.success) {
                setNumbers([]);
                setTotalPages(0);
                setCurrentPage(1);
                setUploadQueue([]);
                setChartData(null); // Reset chart data
                notify('notifications.success.databaseReset');
                return true;
            }
            notify('notifications.error.databaseResetFailed', 'error');
            return false;
        } catch (error) {
            console.error('Error resetting database:', error);
            notify('notifications.error.databaseResetFailed', 'error');
            return false;
        }
    }, []);

    // Upload queue management
    const addToQueue = useCallback((newItem) => {
        setUploadQueue(prev => [...prev, {
            ...newItem,
            order: (prev.length + 1).toString().padStart(3, '0')
        }]);
    }, []);

    const addImageToQueue = useCallback((img, index, caption = '') => {
        addToQueue({
            id: generateId('image'),
            type: 'image',
            file: img.file,
            preview: img.preview,
            caption
        });
        setImages(prev => prev.filter((_, i) => i !== index));
        notify('notifications.success.mediaAdded');
    }, [addToQueue]);

    const addVideoToQueue = useCallback((vid, index, caption = '') => {
        addToQueue({
            id: generateId('video'),
            type: 'video',
            file: vid.file,
            preview: vid.preview,
            caption
        });
        setVideos(prev => prev.filter((_, i) => i !== index));
        notify('notifications.success.mediaAdded');
    }, [addToQueue]);

    const addAudioToQueue = useCallback((aud, index) => {
        addToQueue({
            id: generateId('audio'),
            type: 'audio',
            file: aud.file,
            preview: aud.preview
        });
        setAudios(prev => prev.filter((_, i) => i !== index));
        notify('notifications.success.mediaAdded');
    }, [addToQueue]);

    const addDocumentToQueue = useCallback((doc, index) => {
        addToQueue({
            id: generateId('document'),
            type: 'document',
            file: doc.file,
            name: doc.name
        });
        setDocuments(prev => prev.filter((_, i) => i !== index));
        notify('notifications.success.mediaAdded');
    }, [addToQueue]);

    const addMessageToQueue = useCallback((msg, index) => {
        if (!msg.trim()) return;
        addToQueue({
            id: generateId('message'),
            type: 'message',
            content: msg
        });
        if (messages.length > 1) {
            setMessages(prev => prev.filter((_, i) => i !== index));
        } else {
            setMessages(['']);
        }
        notify('notifications.success.messageAdded');
    }, [addToQueue, messages.length]);

    const removeFromQueue = useCallback((id) => {
        setUploadQueue(prev => prev.filter(item => item.id !== id));
    }, []);

    const reorderQueue = useCallback((oldIndex, newIndex) => {
        setUploadQueue(prev => {
            const newQueue = arrayMove(prev, oldIndex, newIndex);
            return newQueue.map((item, index) => ({
                ...item,
                order: (index + 1).toString().padStart(3, '0')
            }));
        });
    }, []);

    const clearAllUploads = useCallback(() => {
        setUploadQueue([]);
        setImages([]);
        setAudios([]);
        setVideos([]);
        setDocuments([]);
        setMessages(['']);
    }, []);

    // Notification system
    const notify = useCallback((message, type = 'success') => {
        const translatedMessage = t(message);
        toast.dismiss();
        switch (type) {
            case 'success':
                toast.success(translatedMessage);
                break;
            case 'error':
                toast.error(translatedMessage);
                break;
            case 'loading':
                return toast.loading(translatedMessage);
            default:
                toast(translatedMessage);
        }
    }, [t]);

    // Toggle dark mode
    const toggleDarkMode = useCallback(() => {
        const newMode = !darkMode;
        setDarkMode(newMode);
        localStorage.setItem('darkMode', newMode);
        if (newMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [darkMode]);

    // Handle language changes
    useEffect(() => {
        setIsRTL(i18n.language === 'ar');
    }, [i18n.language]);

    // Clean up object URLs
    useEffect(() => {
        return () => {
            [...images, ...audios, ...videos].forEach(item => {
                if (item.preview) URL.revokeObjectURL(item.preview);
            });
        };
    }, [images, audios, videos]);

        // Bot status management
    const fetchBotStatus = useCallback(async () => {
        try {
            setBotStatusLoading(true);
            const result = await window.api.getBotStatus();
            console.log('Bot status fetched:', result);
            if (result?.success) {
                setBotEnabled(result.enabled);
            }
        } catch (error) {
            console.error('Failed to fetch bot status:', error);
            notify('Failed to fetch bot status', 'error');
        } finally {
            setBotStatusLoading(false);
        }
    }, [notify]);

    const toggleBotStatus = useCallback(async () => {
        try {
            const newStatus = !botEnabled;
            const result = await window.api.setBotStatus(newStatus);
            console.log('Bot status updated Is King:', result);

            if (result?.success) {
                setBotEnabled(newStatus);
                notify(
                    newStatus ? 'Bot enabled successfully' : 'Bot disabled successfully',
                    'success'
                );
                return true;
            } else {
                notify('Failed to update bot status', 'error');
                return false;
            }
        } catch (error) {
            console.error('Error toggling bot status:', error);
            notify('Failed to update bot status', 'error');
            return false;
        }
    }, [botEnabled, notify]);

     // Setup bot status listeners
    const setupBotStatusListeners = useCallback(() => {
        if (!window.api) return;

        const handleBotStatusChanged = (enabled) => {
            setBotEnabled(enabled);
            notify(
                enabled ? 'Bot has been enabled' : 'Bot has been disabled',
                'success'
            );
        };

        window.api.receive('bot-status-changed', handleBotStatusChanged);

        return () => {
            if (window.api.removeListener) {
                window.api.removeListener('bot-status-changed', handleBotStatusChanged);
            }
        };
    }, [notify]);

    // Initialize bot status
    useEffect(() => {
        fetchBotStatus();
        const cleanup = setupBotStatusListeners();
        return cleanup;
    }, [fetchBotStatus, setupBotStatusListeners]);

    const value = {
        // Theme and language
        darkMode,
        toggleDarkMode,
        isRTL,

        // WhatsApp connection
        isConnected,
        setIsConnected,
        qrCode,
        isLoading,
        setIsLoading,

        // Upload management
        uploadQueue,
        setUploadQueue,
        images,
        setImages,
        audios,
        setAudios,
        videos,
        setVideos,
        documents,
        setDocuments,
        messages,
        setMessages,
        addImageToQueue,
        addAudioToQueue,
        addVideoToQueue,
        addDocumentToQueue,
        addMessageToQueue,
        removeFromQueue,
        reorderQueue,
        clearAllUploads,
        activeTab,
        setActiveTab,

        // Phone number management
        numbers,
        setNumbers,
        currentPage,
        setCurrentPage,
        totalPages,
        setTotalPages,
        numbersLoading,
        numbersPerPage,
        fetchNumbers,
        resetDatabase,

        // Excel data handling
        excelData,
        setExcelData,
        manualNumber,
        setManualNumber,
        selectedColumn,
        setSelectedColumn,

        // Notification system
        notify,
        // Message Chart
        chartData,
        setChartData,
        // login
        isLoggedIn,
        setIsLoggedIn,
        setKey,
        // Bot Status
        botEnabled,
        setBotEnabled,
        botStatusLoading,
        toggleBotStatus,
        fetchBotStatus,
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useApp must be used within an AppProvider');
    }
    return context;
}

// Helper function for array reordering
function arrayMove(array, fromIndex, toIndex) {
    const newArray = [...array];
    const [movedItem] = newArray.splice(fromIndex, 1);
    newArray.splice(toIndex, 0, movedItem);
    return newArray;
}