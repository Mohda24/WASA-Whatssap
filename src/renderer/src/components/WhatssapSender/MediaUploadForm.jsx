import React from'react';
import { useWhatsAppSender } from '../../context/WhatssapSenderContext';
import { useState } from'react';
import { useApp } from '../../context/AppContext';

export const MediaUploadForm = ({ type }) => {
    const { addMediaItem } = useWhatsAppSender();
    const {darkMode}=useApp()
    const [formData, setFormData] = useState({
        file: null,
        content: '',
        caption: ''
    });

    const handleSubmit = () => {
        if (type === 'text' && formData.content.trim()) {
            addMediaItem({
                type: 'text',
                content: formData.content.trim()
            });
        } else if (formData.file) {
            addMediaItem({
                type,
                name: formData.file.name,
                file: formData.file,
                caption: formData.caption.trim() || undefined
            });
        }
        setFormData({ file: null, content: '', caption: '' });
    };

    const titles = {
        image: '📷 Upload Image',
        video: '🎥 Upload Video',
        audio: '🔊 Upload Audio',
        document: '📄 Upload Document',
        text: '✉️ Add Text Message'
    };

    return (
        <div className={`p-4 rounded-lg border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
            <h3 className="font-semibold mb-3">{titles[type]}</h3>
            <div className="space-y-3">
                {type === 'text' ? (
                    <textarea
                        value={formData.content}
                        onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                        placeholder="Enter your message..."
                        className={`w-full p-2 border rounded-lg resize-none ${darkMode
                                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                            }`}
                        rows="3"
                        required
                    />
                ) : (
                    <>
                        <input
                            type="file"
                            onChange={(e) => setFormData(prev => ({ ...prev, file: e.target.files[0] }))}
                            accept={
                                type === 'image' ? 'image/*' :
                                    type === 'video' ? 'video/*' :
                                        type === 'audio' ? 'audio/*' :
                                            '*/*'
                            }
                            className={`w-full p-2 border rounded-lg ${darkMode
                                    ? 'bg-gray-700 border-gray-600 text-white file:bg-gray-600 file:border-gray-500'
                                    : 'bg-white border-gray-300 text-gray-900 file:bg-gray-100 file:border-gray-300'
                                } file:mr-2 file:py-1 file:px-2 file:rounded file:border file:text-sm`}
                            required
                        />
                        {(type === 'image' || type === 'video') && (
                            <input
                                type="text"
                                value={formData.caption}
                                onChange={(e) => setFormData(prev => ({ ...prev, caption: e.target.value }))}
                                placeholder="Add caption (optional)"
                                className={`w-full p-2 border rounded-lg ${darkMode
                                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                    }`}
                            />
                        )}
                    </>
                )}
                <button
                    onClick={handleSubmit}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors"
                >
                    Add {type === 'text' ? 'Message' : 'Media'}
                </button>
            </div>
        </div>
    );
};
