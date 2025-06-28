import React from 'react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable
} from '@dnd-kit/sortable';
import {
    CSS,
} from '@dnd-kit/utilities';
import {
    Upload,
    X,
    Play,
    Square,
    Camera,
    Video,
    Mic,
    FileText,
    Mail,
    GripVertical,
    Trash2,
    Plus,
    AlertTriangle
} from 'lucide-react';
import { MediaUploadForm } from './WhatssapSender/MediaUploadForm';
import { SortableMediaItem } from './WhatssapSender/SortableMediaItem';
import { useWhatsAppSender } from '../context/WhatssapSenderContext';
import { useApp } from '../context/AppContext';
import { useTranslation } from 'react-i18next';

export const WhatsAppSender = () => {
    const {
        numbers,
        mediaItems,
        isSending,
        progress,
        activeMediaType,
        manualNumbers,
        addNumbers,
        removeNumber,
        startSending,
        stopSending,
        resetAll,
        setActiveMediaType,
        setManualNumbers,
        reorderMediaItems
    } = useWhatsAppSender();
    const { darkMode } = useApp();
    const { t } = useTranslation();

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleExcelUpload = async (e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                // Read file content
                const fileContent = await file.text();
                let extractedNumbers = [];

                if (file.name.endsWith('.csv')) {
                    // Parse CSV
                    const lines = fileContent.split('\n');
                    extractedNumbers = lines
                        .map(line => line.split(',')[0]) // Assume first column has numbers
                        .filter(num => num && num.trim())
                        .map(num => num.trim().replace(/\D/g, '')) // Remove non-digits
                        .filter(num => num.length >= 10); // Basic validation
                } else {
                    // For Excel files, you'd need a proper Excel parser
                    // For now, treat as text and extract numbers
                    const numberRegex = /\b\d{10,15}\b/g;
                    extractedNumbers = fileContent.match(numberRegex) || [];
                }

                if (extractedNumbers.length > 0) {
                    addNumbers(extractedNumbers);
                    alert(t('whatsappSender.alerts.numbersAdded', { count: extractedNumbers.length }));
                } else {
                    alert(t('whatsappSender.alerts.noValidNumbers'));
                }
            } catch (error) {
                console.error('Error reading file:', error);
                alert(t('whatsappSender.alerts.fileReadError'));
            }
            e.target.value = '';
        }
    };

    const handleManualSubmit = () => {
        if (manualNumbers.trim()) {
            const nums = manualNumbers
                .split(/[\n,;]/)
                .map(n => n.trim().replace(/\D/g, '')) // Remove non-digits
                .filter(n => n && n.length >= 10); // Basic validation
            
            if (nums.length > 0) {
                addNumbers(nums);
                setManualNumbers('');
            } else {
                alert(t('whatsappSender.alerts.enterValidNumbers'));
            }
        }
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (active.id !== over.id) {
            reorderMediaItems(active.id, over.id);
        }
    };

    const mediaTypes = [
        { type: 'image', icon: Camera, label: t('whatsappSender.mediaTypes.image') },
        { type: 'video', icon: Video, label: t('whatsappSender.mediaTypes.video') },
        { type: 'audio', icon: Mic, label: t('whatsappSender.mediaTypes.audio') },
        { type: 'document', icon: FileText, label: t('whatsappSender.mediaTypes.document') },
        { type: 'text', icon: Mail, label: t('whatsappSender.mediaTypes.text') }
    ];

    const getStatusColor = (status) => {
        switch (status) {
            case 'Success': return 'text-green-600';
            case 'Failed': return 'text-red-600';
            case 'Sending': return 'text-blue-600';
            case 'Cancelled': return 'text-yellow-600';
            default: return darkMode ? 'text-gray-400' : 'text-gray-600';
        }
    };

    return (
        <div className={`min-h-screen p-6 transition-colors ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
            }`}>
            <div className="max-w-7xl mx-auto">
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-3xl font-bold">{t('whatsappSender.title')}</h1>
                    <button
                        onClick={resetAll}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                    >
                        {t('whatsappSender.buttons.resetAll')}
                    </button>
                </div>

                {/* Safety Alert */}
                <div className={`mb-6 p-3 rounded-lg border-l-4 flex items-center ${darkMode 
                    ? 'bg-amber-900/20 border-amber-500 text-amber-200' 
                    : 'bg-amber-50 border-amber-500 text-amber-800'
                }`}>
                    <AlertTriangle className="w-4 h-4 mr-2 flex-shrink-0" />
                    <p className="text-sm">
                        {t('whatsappSender.safety.openChatsWarning')}
                    </p>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Upload Numbers Section */}
                    <div className={`p-6 rounded-xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                        }`}>
                        <h2 className="text-xl font-semibold mb-4">{t('whatsappSender.sections.uploadNumbers')}</h2>

                        {/* Excel/CSV Upload */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2">{t('whatsappSender.upload.csvExcelLabel')}</label>
                            <input
                                type="file"
                                accept=".xlsx,.xls,.csv"
                                onChange={handleExcelUpload}
                                className={`w-full p-2 border rounded-lg ${darkMode
                                    ? 'bg-gray-700 border-gray-600 file:bg-gray-600 file:border-gray-500 file:text-white'
                                    : 'bg-white border-gray-300 file:bg-gray-100 file:border-gray-300'
                                    } file:mr-2 file:py-1 file:px-2 file:rounded file:border file:text-sm`}
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                {t('whatsappSender.upload.csvDescription')}
                            </p>
                        </div>

                        {/* Manual Entry */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2">{t('whatsappSender.upload.manualEntryLabel')}</label>
                            <textarea
                                value={manualNumbers}
                                onChange={(e) => setManualNumbers(e.target.value)}
                                placeholder={t('whatsappSender.upload.manualEntryPlaceholder')}
                                className={`w-full p-2 border rounded-lg resize-none ${darkMode
                                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                    }`}
                                rows="4"
                            />
                            <button
                                onClick={handleManualSubmit}
                                className="mt-2 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
                            >
                                <Plus className="w-4 h-4 inline mr-2" />
                                {t('whatsappSender.buttons.addNumbers')}
                            </button>
                        </div>

                        {/* Control Panel */}
                        <div className="space-y-3">
                            <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'
                                }`}>
                                <div className="text-sm">
                                    {t('whatsappSender.stats.totalNumbers')}: {numbers.length}
                                </div>
                                <div className="text-sm">
                                    {t('whatsappSender.stats.progress')}: {progress.sent}/{progress.total} {t('whatsappSender.stats.sent')}
                                </div>
                                {progress.total > 0 && (
                                    <div className={`w-full rounded-full h-2 mt-2 ${darkMode ? 'bg-gray-600' : 'bg-gray-300'
                                        }`}>
                                        <div
                                            className="bg-green-600 h-2 rounded-full transition-all"
                                            style={{ width: `${(progress.sent / progress.total) * 100}%` }}
                                        ></div>
                                    </div>
                                )}
                            </div>

                            {!isSending ? (
                                <button
                                    onClick={startSending}
                                    disabled={numbers.length === 0 || mediaItems.length === 0}
                                    className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
                                >
                                    <Play className="w-4 h-4 mr-2" />
                                    {t('whatsappSender.buttons.startBulkSending')}
                                </button>
                            ) : (
                                <button
                                    onClick={stopSending}
                                    className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
                                >
                                    <Square className="w-4 h-4 mr-2" />
                                    {t('whatsappSender.buttons.stopSending')}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Preview Section */}
                    <div className={`p-6 rounded-xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                        }`}>
                        <h2 className="text-xl font-semibold mb-4">{t('whatsappSender.sections.numbersStatus')}</h2>

                        <div className="space-y-2 max-h-96 overflow-y-auto">
                            {numbers.length === 0 ? (
                                <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'
                                    }`}>
                                    <Upload className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                    <p>{t('whatsappSender.empty.noNumbers')}</p>
                                    <p className="text-sm">{t('whatsappSender.empty.noNumbersDescription')}</p>
                                </div>
                            ) : (
                                numbers.map((num) => (
                                    <div
                                        key={num.id}
                                        className={`flex items-center justify-between p-3 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                                            }`}
                                    >
                                        <div className="flex-1">
                                            <div className="font-mono text-sm">{num.number}</div>
                                            <div className={`text-xs ${getStatusColor(num.status)}`}>
                                                {num.status}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => removeNumber(num.id)}
                                            disabled={isSending}
                                            className="text-red-500 hover:text-red-700 p-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Media Upload Section */}
                    <div className={`p-6 rounded-xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                        }`}>
                        <h2 className="text-xl font-semibold mb-4">{t('whatsappSender.sections.mediaMessages')}</h2>

                        {/* Media Type Buttons */}
                        <div className="grid grid-cols-5 gap-2 mb-4">
                            {mediaTypes.map(({ type, icon: Icon, label }) => (
                                <button
                                    key={type}
                                    onClick={() => setActiveMediaType(activeMediaType === type ? null : type)}
                                    disabled={isSending}
                                    className={`p-2 rounded-lg border text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${activeMediaType === type
                                        ? 'bg-blue-600 text-white border-blue-600'
                                        : darkMode
                                            ? 'bg-gray-700 border-gray-600 hover:bg-gray-600'
                                            : 'bg-white border-gray-300 hover:bg-gray-50'
                                        }`}
                                >
                                    <Icon className="w-4 h-4 mx-auto mb-1" />
                                    {label}
                                </button>
                            ))}
                        </div>

                        {/* Active Media Form */}
                        {activeMediaType && (
                            <div className="mb-4">
                                <MediaUploadForm type={activeMediaType} t={t} />
                            </div>
                        )}

                        {/* Sortable Media List */}
                        <div className="space-y-2">
                            <h3 className="font-medium">{t('whatsappSender.queue.title')} ({mediaItems.length})</h3>
                            <DndContext
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                onDragEnd={handleDragEnd}
                            >
                                <SortableContext
                                    items={mediaItems.map(item => item.id)}
                                    strategy={verticalListSortingStrategy}
                                >
                                    <div className="space-y-2 max-h-64 overflow-y-auto">
                                        {mediaItems.length === 0 ? (
                                            <div className={`text-center py-4 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'
                                                }`}>
                                                <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                                <p>{t('whatsappSender.empty.noMedia')}</p>
                                                <p className="text-xs">{t('whatsappSender.empty.noMediaDescription')}</p>
                                            </div>
                                        ) : (
                                            mediaItems.map((item) => (
                                                <SortableMediaItem key={item.id} item={item} t={t} />
                                            ))
                                        )}
                                    </div>
                                </SortableContext>
                            </DndContext>
                        </div>

                        {/* Sending Instructions */}
                        {mediaItems.length > 0 && (
                            <div className={`mt-4 p-3 rounded-lg text-xs ${darkMode ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-50 text-blue-700'
                                }`}>
                                <p className="font-medium mb-1">{t('whatsappSender.instructions.title')}</p>
                                <p>{t('whatsappSender.instructions.description')}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Status Bar */}
                {isSending && (
                    <div className={`mt-6 p-4 rounded-lg border ${darkMode ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'
                        }`}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-3"></div>
                                <span className="font-medium">{t('whatsappSender.status.bulkSendingInProgress')}</span>
                            </div>
                            <div className="text-sm">
                                {progress.sent} {t('whatsappSender.status.of')} {progress.total} {t('whatsappSender.status.completed')}
                            </div>
                        </div>
                        <div className="text-sm text-gray-600 mt-2">
                            {t('whatsappSender.status.keepAppOpen')}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};