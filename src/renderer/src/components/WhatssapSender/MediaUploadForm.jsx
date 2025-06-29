import React, { useState } from 'react';
import { Upload, FileText, Image, Video, Mic, Send } from 'lucide-react';
import { useWhatsAppSender } from '../../context/WhatssapSenderContext';
import { useApp } from '../../context/AppContext';

export const MediaUploadForm = ({ type }) => {
    const [content, setContent] = useState('');
    const [caption, setCaption] = useState('');
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    
    const { addMediaItem } = useWhatsAppSender();
    const { darkMode } = useApp();

    // Convert file to base64
    const fileToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = (error) => reject(error);
        });
    };

    const handleFileChange = async (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setIsLoading(true);
            try {
                // Convert file to base64
                const base64Data = await fileToBase64(selectedFile);
                
                setFile(selectedFile);
                setPreview(base64Data);
                
                console.log('File selected:', {
                    name: selectedFile.name,
                    type: selectedFile.type,
                    size: selectedFile.size,
                    base64Length: base64Data.length
                });
            } catch (error) {
                console.error('Error converting file to base64:', error);
                alert('Error processing file. Please try again.');
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (type === 'text') {
            if (!content.trim()) {
                alert('Please enter text content');
                return;
            }
            
            addMediaItem({
                type: 'text',
                content: content.trim(),
                name: `Text Message ${Date.now()}`,
                caption: '',
                data: null, // Text messages don't need data
                mimeType: 'text/plain',
                size: content.length
            });
            
            setContent('');
        } else {
            if (!file) {
                alert('Please select a file');
                return;
            }
            
            try {
                // Ensure we have the base64 data
                const base64Data = preview || await fileToBase64(file);
                
                if (!base64Data) {
                    throw new Error('Failed to process file data');
                }
                
                const mediaItem = {
                    type: type,
                    content: undefined, // Only text messages have content
                    name: file.name,
                    caption: caption.trim(),
                    data: base64Data, // This is the crucial part - base64 data with prefix
                    mimeType: file.type || 'application/octet-stream',
                    size: file.size
                };
                
                console.log('Adding media item:', {
                    ...mediaItem,
                    data: `${base64Data.substring(0, 50)}... (${base64Data.length} chars total)`
                });
                
                addMediaItem(mediaItem);
                
                // Reset state
                setFile(null);
                setPreview(null);
                setCaption('');
                
                // Reset file input
                const fileInput = document.querySelector(`input[type="file"][accept*="${type}"]`);
                if (fileInput) {
                    fileInput.value = '';
                }
                
            } catch (error) {
                console.error('Error adding media item:', error);
                alert('Error adding media item. Please try again.');
            }
        }
    };

    const getAcceptTypes = () => {
        switch (type) {
            case 'image': return 'image/*';
            case 'video': return 'video/*';
            case 'audio': return 'audio/*';
            case 'document': return '.pdf,.doc,.docx,.txt,.xlsx,.xls,.ppt,.pptx';
            default: return '*/*';
        }
    };

    const getIcon = () => {
        switch (type) {
            case 'image': return Image;
            case 'video': return Video;
            case 'audio': return Mic;
            case 'document': return FileText;
            case 'text': return FileText;
            default: return Upload;
        }
    };

    const Icon = getIcon();

    return (
        <div className={`p-4 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
            <div className="flex items-center mb-3">
                <Icon className="w-5 h-5 mr-2" />
                <h3 className="font-medium">Add {type.charAt(0).toUpperCase() + type.slice(1)}</h3>
            </div>

            {type === 'text' ? (
                <div className="space-y-3">
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Enter your text message..."
                        className={`w-full p-3 border rounded-lg resize-none ${
                            darkMode
                                ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400'
                                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                        }`}
                        rows={4}
                    />
                </div>
            ) : (
                <div className="space-y-3">
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Select {type} file
                        </label>
                        <input
                            type="file"
                            accept={type === 'audio' ? 'audio/opus,.opus' : getAcceptTypes()}
                            onChange={handleFileChange}
                            className={`w-full p-2 border rounded-lg ${
                                darkMode
                                    ? 'bg-gray-800 border-gray-600 file:bg-gray-700 file:border-gray-500 file:text-white'
                                    : 'bg-white border-gray-300 file:bg-gray-100 file:border-gray-300'
                            } file:mr-2 file:py-1 file:px-2 file:rounded file:border file:text-sm`}
                            disabled={isLoading}
                        />
                    </div>

                    {/* File Preview */}
                    {preview && (
                        <div className={`p-2 rounded border ${darkMode ? 'bg-gray-800 border-gray-600' : 'bg-gray-100 border-gray-200'}`}>
                            <div className="text-sm font-medium mb-2">Preview:</div>
                            {type === 'image' && (
                                <img 
                                    src={preview} 
                                    alt="Preview" 
                                    className="max-w-full h-32 object-contain rounded"
                                />
                            )}
                            {type === 'video' && (
                                <video 
                                    src={preview} 
                                    className="max-w-full h-32 object-contain rounded" 
                                    controls
                                />
                            )}
                            {type === 'audio' && (
                                <audio 
                                    src={preview} 
                                    className="w-full" 
                                    controls
                                    
                                />
                            )}
                            {type === 'document' && (
                                <div className="flex items-center">
                                    <FileText className="w-8 h-8 mr-2" />
                                    <div>
                                        <div className="font-medium">{file?.name}</div>
                                        <div className="text-xs text-gray-500">
                                            {file && (file.size / 1024 / 1024).toFixed(2)} MB
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Caption (optional)
                        </label>
                        <input
                            type="text"
                            value={caption}
                            onChange={(e) => setCaption(e.target.value)}
                            placeholder="Add a caption..."
                            className={`w-full p-2 border rounded-lg ${
                                darkMode
                                    ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400'
                                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                            }`}
                        />
                    </div>
                </div>
            )}

            <button
                onClick={handleSubmit}
                disabled={isLoading || (type === 'text' ? !content.trim() : !file)}
                className="w-full mt-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
            >
                {isLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                    <Send className="w-4 h-4 mr-2" />
                )}
                {isLoading ? 'Processing...' : `Add ${type.charAt(0).toUpperCase() + type.slice(1)}`}
            </button>
        </div>
    );
};