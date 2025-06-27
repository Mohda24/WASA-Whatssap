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
    Plus
} from 'lucide-react';
import { MediaUploadForm } from './WhatssapSender/MediaUploadForm';

import { SortableMediaItem } from './WhatssapSender/SortableMediaItem';
import { useWhatsAppSender } from '../context/WhatssapSenderContext';
import { useApp } from '../context/AppContext';

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
    const {darkMode}=useApp()

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleExcelUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Simulate Excel parsing - in real app, use xlsx library
            const sampleNumbers = ['1234567890', '0987654321', '1122334455'];
            addNumbers(sampleNumbers);
            e.target.value = '';
        }
    };

    const handleManualSubmit = () => {
        if (manualNumbers.trim()) {
            const nums = manualNumbers
                .split(/[\n,;]/)
                .map(n => n.trim())
                .filter(n => n);
            addNumbers(nums);
            setManualNumbers('');
        }
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (active.id !== over.id) {
            reorderMediaItems(active.id, over.id);
        }
    };

    const mediaTypes = [
        { type: 'image', icon: Camera, label: 'Image' },
        { type: 'video', icon: Video, label: 'Video' },
        { type: 'audio', icon: Mic, label: 'Audio' },
        { type: 'document', icon: FileText, label: 'Document' },
        { type: 'text', icon: Mail, label: 'Text' }
    ];

    const getStatusColor = (status) => {
        switch (status) {
            case 'Success': return 'text-green-600';
            case 'Failed': return 'text-red-600';
            case 'Sending': return 'text-blue-600';
            default: return darkMode ? 'text-gray-400' : 'text-gray-600';
        }
    };

    return (
        <div className={`min-h-screen p-6 transition-colors ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
            }`}>
            <div className="max-w-7xl mx-auto">
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-3xl font-bold">WhatsApp Sender</h1>
                    <button
                        onClick={resetAll}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                    >
                        Reset All
                    </button>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Upload Numbers Section */}
                    <div className={`p-6 rounded-xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                        }`}>
                        <h2 className="text-xl font-semibold mb-4">📱 Upload Numbers</h2>

                        {/* Excel Upload */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2">Upload Excel File</label>
                            <input
                                type="file"
                                accept=".xlsx,.xls,.csv"
                                onChange={handleExcelUpload}
                                className={`w-full p-2 border rounded-lg ${darkMode
                                    ? 'bg-gray-700 border-gray-600 file:bg-gray-600 file:border-gray-500 file:text-white'
                                    : 'bg-white border-gray-300 file:bg-gray-100 file:border-gray-300'
                                    } file:mr-2 file:py-1 file:px-2 file:rounded file:border file:text-sm`}
                            />
                        </div>

                        {/* Manual Entry */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2">Manual Entry</label>
                            <textarea
                                value={manualNumbers}
                                onChange={(e) => setManualNumbers(e.target.value)}
                                placeholder="Enter numbers (one per line or comma separated)"
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
                                Add Numbers
                            </button>
                        </div>

                        {/* Control Panel */}
                        <div className="space-y-3">
                            <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'
                                }`}>
                                <div className="text-sm">
                                    Progress: {progress.sent}/{progress.total} sent
                                </div>
                                {progress.total > 0 && (
                                    <div className={`w-full bg-gray-300 rounded-full h-2 mt-2 ${darkMode ? 'bg-gray-600' : 'bg-gray-300'
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
                                    Start Sending
                                </button>
                            ) : (
                                <button
                                    onClick={stopSending}
                                    className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
                                >
                                    <Square className="w-4 h-4 mr-2" />
                                    Stop Sending
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Preview Section */}
                    <div className={`p-6 rounded-xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                        }`}>
                        <h2 className="text-xl font-semibold mb-4">📊 Preview & Status</h2>

                        <div className="space-y-2 max-h-96 overflow-y-auto">
                            {numbers.length === 0 ? (
                                <p className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'
                                    }`}>
                                    No numbers uploaded yet
                                </p>
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
                                            className="text-red-500 hover:text-red-700 p-1"
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
                        <h2 className="text-xl font-semibold mb-4">📎 Media & Messages</h2>

                        {/* Media Type Buttons */}
                        <div className="grid grid-cols-5 gap-2 mb-4">
                            {mediaTypes.map(({ type, icon: Icon, label }) => (
                                <button
                                    key={type}
                                    onClick={() => setActiveMediaType(activeMediaType === type ? null : type)}
                                    className={`p-2 rounded-lg border text-xs transition-colors ${activeMediaType === type
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
                                <MediaUploadForm type={activeMediaType} />
                            </div>
                        )}

                        {/* Sortable Media List */}
                        <div className="space-y-2">
                            <h3 className="font-medium">Sending Queue ({mediaItems.length})</h3>
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
                                            <p className={`text-center py-4 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'
                                                }`}>
                                                No media added yet
                                            </p>
                                        ) : (
                                            mediaItems.map((item) => (
                                                <SortableMediaItem key={item.id} item={item} />
                                            ))
                                        )}
                                    </div>
                                </SortableContext>
                            </DndContext>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};