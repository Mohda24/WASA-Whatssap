import React, { useState, useCallback, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useDropzone } from 'react-dropzone'
import BotToggleSwitch from './shared/SwitcherEnablBotStatut'
import {
    CloudArrowUpIcon,
    XMarkIcon,
    PhotoIcon,
    MusicalNoteIcon,
    ChatBubbleBottomCenterTextIcon,
    ArrowsUpDownIcon,
    PlusIcon,
    FilmIcon,
    DocumentIcon,
    MicrophoneIcon,
    VideoCameraIcon,
    ChatBubbleLeftRightIcon,
    DocumentTextIcon,
    SpeakerWaveIcon

} from '@heroicons/react/24/outline'
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core'
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useApp } from '../context/AppContext'

export default function UploadData() {
    const [loading, setLoading] = useState(false)

    const { t } = useTranslation()
    const {
        darkMode,
        uploadQueue,
        setUploadQueue,
        images,
        setImages,
        audios,
        videos,     // Add this
        setVideos,
        setAudios,
        messages,
        setMessages,
        addImageToQueue,
        addAudioToQueue,
        addVideoToQueue,
        addMessageToQueue,
        documents,           // Add this
        setDocuments,       // Add this
        addDocumentToQueue,
        activeTab,
        setActiveTab
    } = useApp()

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    )
    console.log("habib", uploadQueue)

    const onDropImages = useCallback(acceptedFiles => {
        setImages(prev => [
            ...prev,
            ...acceptedFiles.map(file => ({ file, preview: URL.createObjectURL(file) }))
        ])
    }, [setImages])

    const onDropAudios = useCallback(acceptedFiles => {
        setAudios(prev => [
            ...prev,
            ...acceptedFiles.map(file => ({ file, preview: URL.createObjectURL(file) }))
        ])
    }, [setAudios])

    const onDropVideos = useCallback(acceptedFiles => {
        setVideos(prev => [
            ...prev,
            ...acceptedFiles.map(file => ({ file, preview: URL.createObjectURL(file) }))
        ])
    }, [setVideos])

    const onDropDocuments = useCallback(acceptedFiles => {
        console.log("Document files received:", acceptedFiles);
        // Simplify by just storing the file without preview
        setDocuments(prev => [
            ...prev,
            ...acceptedFiles.map(file => ({
                file,
                // No preview needed, just store the name for display
                name: file.name
            }))
        ]);
    }, [setDocuments]);

    const { getRootProps: getImageProps, getInputProps: getImageInputProps } = useDropzone({ onDrop: onDropImages, accept: { 'image/*': [] } })
    const { getRootProps: getAudioProps, getInputProps: getAudioInputProps } = useDropzone({ onDrop: onDropAudios, accept: { 'audio/*': [] } })
    const { getRootProps: getVideoProps, getInputProps: getVideoInputProps } = useDropzone({
        onDrop: onDropVideos,
        accept: { 'video/*': [] },
        maxSize: 10 * 1024 * 1024, // 10MB in bytes
        onDropRejected: (rejectedFiles) => {
            rejectedFiles.forEach(({ file, errors }) => {
                errors.forEach(error => {
                    if (error.code === 'file-too-large') {
                        alert(`File ${file.name} is too large. Maximum size is 10MB.`);
                    }
                });
            });
        }
    })
    const { getRootProps: getDocumentProps, getInputProps: getDocumentInputProps } = useDropzone({
        onDrop: onDropDocuments,
        accept: {
            'application/pdf': [],
            'application/msword': [],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [],
            'application/vnd.ms-excel': [],
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': [],
            'text/plain': []
        }
    })

    useEffect(() => {
        const blobUrls = []

        // تخزين عناوين URL للـ blob عند إنشائها
        const createPreview = (file) => {
            if (file && (file.type.startsWith('image/') || file.type.startsWith('video/') || file.type.startsWith('audio/'))) {
                const preview = URL.createObjectURL(file)
                blobUrls.push(preview)
                return preview
            }
            return null // لا نحتاج إلى معاينة للمستندات
        }

        // وظيفة التنظيف
        return () => {
            blobUrls.forEach(url => {
                if (url) {
                    try {
                        URL.revokeObjectURL(url)
                    } catch (error) {
                        console.warn('Failed to revoke URL:', error)
                    }
                }
            })
        }
    }, [images, audios, videos, uploadQueue])

    // Update the removeFromQueue function
    const removeFromQueue = id => {
        console.log("mohda")
        const idx = uploadQueue.findIndex(item => item.id === id)
        if (idx === -1) return
        const item = uploadQueue[idx]

        setUploadQueue(q => {
            const newQ = [...q]
            newQ.splice(idx, 1)
            return newQ
        })

        // Only try to add back to respective arrays if it's not an existing file
        if (!item.existingFile) {
            // Create new preview URL before adding back to respective arrays
            switch (item.type) {
                case 'image':
                case 'audio':
                case 'video':
                    if (item.file) {
                        const newPreview = URL.createObjectURL(item.file)
                        switch (item.type) {
                            case 'image':
                                setImages(prev => [...prev, { file: item.file, preview: newPreview }])
                                break
                            case 'audio':
                                setAudios(prev => [...prev, { file: item.file, preview: newPreview }])
                                break
                            case 'video':
                                setVideos(prev => [...prev, { file: item.file, preview: newPreview }])
                                break
                        }
                    }
                    break
                case 'document':
                    // Simplified - just add back to documents without preview
                    if (item.file) {
                        setDocuments(prev => [...prev, { file: item.file, name: item.file.name }])
                    }
                    break
                case 'message':
                    setMessages(prev => [...prev, item.content])
                    break
            }
        }
    }


    const removeMessage = i => setMessages(prev => prev.filter((_, idx) => idx !== i))
    const addMessage = () => setMessages(prev => [...prev, ''])
    const updateMessage = (i, v) => setMessages(prev => prev.map((m, idx) => idx === i ? v : m))
    const handleDragEnd = event => {
        const { active, over } = event

        if (!active || !over || active.id === over.id) return

        setUploadQueue(items => {
            const oldIndex = items.findIndex(item => item.id === active.id)
            const newIndex = items.findIndex(item => item.id === over.id)

            if (oldIndex === -1 || newIndex === -1) return items

            // Move only the dragged item
            return arrayMove(items, oldIndex, newIndex)
        })
    }

    // Load existing media files when component mounts
    useEffect(() => {
        const loadExistingMedia = async () => {
            try {
                const result = await window.api.getExistingMedia();
                if (result && result.mediaData && result.mediaData.length > 0) {
                    // Convert the loaded media into queue items
                    const queueItems = result.mediaData.map(item => {
                        const id = `${item.type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

                        if (item.type === 'message') {
                            return {
                                id,
                                type: 'message',
                                content: item.content,
                                order: item.order
                            };
                        } else {
                            // For files, we need to create a File object
                            return {
                                id,
                                type: item.type,
                                filePath: item.filePath,
                                name: item.originalName || item.name.split('_').slice(1).join('_'),
                                order: item.order,
                                existingFile: true
                            };
                        }
                    });

                    // Sort by order
                    queueItems.sort((a, b) => parseInt(a.order) - parseInt(b.order));

                    // Set the queue
                    setUploadQueue(queueItems);
                }
            } catch (err) {
                console.error('Error loading existing media:', err);
            }
        };

        loadExistingMedia();
    }, []);

    // Add new state for selected images
    const [selectedImages, setSelectedImages] = useState({});
    const [selectAll, setSelectAll] = useState(false);

    // Add handler for select all
    const handleSelectAll = () => {
        const newSelectAll = !selectAll;
        setSelectAll(newSelectAll);

        const newSelected = {};
        images.forEach((_, index) => {
            newSelected[index] = newSelectAll;
        });
        setSelectedImages(newSelected);
    };

    // Add handler for individual selection
    const handleSelectImage = (index) => {
        const newSelected = {
            ...selectedImages,
            [index]: !selectedImages[index]
        };
        setSelectedImages(newSelected);

        // Update selectAll state based on if all images are selected
        setSelectAll(images.length > 0 && Object.values(newSelected).every(value => value));
    };

    // Add handler for adding selected images to queue
    const addSelectedToQueue = () => {
        const timestamp = Date.now()
        const selectedItems = images
            .map((img, index) => ({ img, index, isSelected: selectedImages[index] }))
            .filter(item => item.isSelected);

        selectedItems.forEach(({ img, index }, arrayIndex) => {
            const uniqueId = `image_${timestamp}_${arrayIndex}`
            addImageToQueue(
                { ...img, id: uniqueId },
                index,
                imageCaptions[index] || ''
            );
        });

        // Remove selected images from the images array
        const newImages = images.filter((_, index) => !selectedImages[index]);
        setImages(newImages);

        // Clear selections after adding to queue
        setSelectedImages({});
        setSelectAll(false);

    };

    // Add new state for selected videos
    const [selectedVideos, setSelectedVideos] = useState({});
    const [selectAllVideos, setSelectAllVideos] = useState(false);

    // Add handler for select all videos
    const handleSelectAllVideos = () => {
        const newSelectAll = !selectAllVideos;
        setSelectAllVideos(newSelectAll);

        const newSelected = {};
        videos.forEach((_, index) => {
            newSelected[index] = newSelectAll;
        });
        setSelectedVideos(newSelected);
    };

    // Add handler for individual video selection
    const handleSelectVideo = (index) => {
        const newSelected = {
            ...selectedVideos,
            [index]: !selectedVideos[index]
        };
        setSelectedVideos(newSelected);

        // Update selectAll state based on if all videos are selected
        setSelectAllVideos(videos.length > 0 && Object.values(newSelected).every(value => value));
    };

    // Add handler for adding selected videos to queue
    const addSelectedVideosToQueue = () => {
        const timestamp = Date.now()
        const selectedItems = videos
            .map((vid, index) => ({ vid, index, isSelected: selectedVideos[index] }))
            .filter(item => item.isSelected);

        selectedItems.forEach(({ vid, index }, arrayIndex) => {
            const uniqueId = `video_${timestamp}_${arrayIndex}`
            addVideoToQueue(
                { ...vid, id: uniqueId },
                index,
                videoCaptions[index] || ''
            );
        });

        // Remove selected videos from the videos array
        const newVideos = videos.filter((_, index) => !selectedVideos[index]);
        setVideos(newVideos);

        // Clear selections after adding to queue
        setSelectedVideos({});
        setSelectAllVideos(false);
    };






    // Add state for captions
    const [imageCaptions, setImageCaptions] = useState({});
    const [videoCaptions, setVideoCaptions] = useState({});

    // Update the handleSubmit function to include captions
    const handleSubmit = async () => {
        try {
            setLoading(true)
            // / Check if there are items in the queue
            if (uploadQueue.length === 0) {
                console.error('Upload queue is empty');
                return;
            }
            console.log(uploadQueue)
            const orderedData = await Promise.all(

                uploadQueue.map(async (item, index) => {
                    const order = (index + 1).toString().padStart(3, '0')

                    // If it's an existing file, just pass the file path
                    if (item.existingFile) {
                        return {
                            type: item.type,
                            name: item.name,
                            filePath: item.filePath,
                            order: order,
                            existingFile: true,
                            caption: item.caption // Add caption if it exists
                        }
                    }

                    // For message type
                    if (item.type === 'message') {
                        return {
                            type: 'message',
                            name: 'message',
                            content: item.content,
                            order: order
                        }
                    }

                    // For file types
                    const buffer = await item.file.arrayBuffer()
                    return {
                        type: item.type,
                        name: item.file.name,
                        buffer: Array.from(new Uint8Array(buffer)),
                        order: order,
                        caption: item.caption // Add caption if it exists
                    }
                })
            )

            const result = await window.api.sendUpload({ orderedData })
            if (result.success) {
                setUploadQueue([])
                setDocuments([])
                setImages([])
                setAudios([])
                setVideos([])
                setMessages([]) // Clear messages after upload
                setImageCaptions({})
                setVideoCaptions({})

                console.log('Upload successful')
            } else {
                console.error('Upload failed:', result.error)
            }
        } catch (err) {
            console.error('Upload error:', err)
        } finally {
            setLoading(false)
        }
    }

    const tabConfig = [
        { title: t('upload.images.title'), icon: PhotoIcon, name: "Images" },
        { title: t('upload.videos.title'), icon: VideoCameraIcon, name: "Videos" },
        { title: t('upload.messages.title'), icon: ChatBubbleLeftRightIcon, name: "Messages" },
        { title: t('upload.documents.title'), icon: DocumentTextIcon, name: "Documents" },
        { title: t('upload.audio.title'), icon: SpeakerWaveIcon, name: "Audio" }
    ];




    // Replace the input fields with textareas in your JSX
    return (
        <>
         
            <div className="flex h-full gap-4 p-6 overflow-x-hidden" 
            >
               
                {/* Left Panel - Dynamic Content Tabs */}
                <div className="w-2/3 flex flex-col h-screen">
                <BotToggleSwitch/>
                

                    <div className={`flex mt-1 space-x-0 mb-6 border-b overflow-x-auto scrollbar-hide ${
                        darkMode ? 'border-gray-600' : 'border-gray-200'
                    }`}>
                        {tabConfig.map(({ name, icon: Icon, title }) => (
                            <button
                                key={name}
                                onClick={() => setActiveTab(name)}
                                className={`group relative flex items-center gap-2 px-6 py-3 text-sm font-medium whitespace-nowrap overflow-hidden
                                    transition-all duration-200 ease-in-out
                                    ${activeTab === name
                                        ? `${darkMode 
                                            ? 'text-blue-400 bg-blue-900/30 shadow-lg' 
                                            : 'text-blue-600 bg-blue-50/80 shadow-md'
                                        }`
                                        : `${darkMode 
                                            ? 'text-gray-300 hover:text-white hover:bg-gray-700/60' 
                                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                        }`
                                    }`}
                            >
                                <Icon className={`h-5 w-5 transition-colors duration-200
                                    ${activeTab === name
                                        ? `${darkMode ? 'text-blue-400' : 'text-blue-600'}`
                                        : `${darkMode 
                                            ? 'text-gray-400 group-hover:text-gray-200' 
                                            : 'text-gray-500 group-hover:text-gray-700'
                                        }`
                                    }`}
                                />
                                <span>{title}</span>

                                {/* Active indicator */}
                                <div className={`absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full transition-all duration-200
                                    ${activeTab === name
                                        ? `${darkMode ? 'bg-blue-400 opacity-100' : 'bg-blue-600 opacity-100'}`
                                        : 'bg-transparent opacity-0'
                                    }`}
                                />

                                {/* Subtle gradient background on hover */}
                                <div className={`absolute inset-0 rounded-t-lg transition-opacity duration-200
                                    ${activeTab === name
                                        ? `${darkMode 
                                            ? 'bg-gradient-to-b from-blue-800/40 to-transparent opacity-100' 
                                            : 'bg-gradient-to-b from-blue-50/90 to-transparent opacity-100'
                                        }`
                                        : `${darkMode 
                                            ? 'bg-gradient-to-b from-gray-700/50 to-transparent opacity-0 group-hover:opacity-100' 
                                            : 'bg-gradient-to-b from-gray-50/70 to-transparent opacity-0 group-hover:opacity-100'
                                        }`
                                    }`}
                                />
                            </button>
                        ))}
                    </div>
                    {/* Tab Content */}
                    <div className={`flex-1 overflow-y-auto rounded-lg shadow-sm ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                        <div className="p-6">
                            {/* Images */}
                            {/* Images Tab */}
                            {activeTab === 'Images' && (
                                <div className="space-y-8">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
                                            <PhotoIcon className="h-7 w-7 text-white" />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                                {t('upload.images.title')}
                                            </h2>
                                            <p className="text-gray-500 dark:text-gray-400 text-sm">{t('upload.images.description')}</p>
                                        </div>
                                    </div>

                                    {/* Modern Dropzone */}
                                    <div {...getImageProps()} className={`group relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 hover:scale-[1.02] ${darkMode
                                        ? 'border-gray-600 hover:border-blue-400 bg-gradient-to-br from-gray-800/50 to-gray-700/50 hover:from-blue-900/20 hover:to-purple-900/20'
                                        : 'border-gray-300 hover:border-blue-500 bg-gradient-to-br from-blue-50/50 to-purple-50/50 hover:from-blue-100/70 hover:to-purple-100/70'
                                        }`}>
                                        <input {...getImageInputProps()} />
                                        <div className="space-y-4">
                                            <div className="relative">
                                                <CloudArrowUpIcon className={`h-16 w-16 mx-auto transition-all duration-300 group-hover:scale-110 ${darkMode ? 'text-gray-500 group-hover:text-blue-400' : 'text-gray-400 group-hover:text-blue-500'
                                                    }`} />
                                                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-xl"></div>
                                            </div>
                                            <div>
                                                <p className={`text-lg font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                    {t('upload.images.dropzone')}
                                                </p>
                                                <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                                                    or click to browse
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Images Grid */}
                                    {images.length > 0 && (
                                        <div className="space-y-6">
                                            {/* Selection Controls */}
                                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 bg-gray-50/50 dark:bg-gray-700/30 rounded-xl">
                                                <div className="flex items-center gap-3">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectAll}
                                                        onChange={handleSelectAll}
                                                        className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                                    />
                                                    <span className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                        Select All ({images.length} items)
                                                    </span>
                                                </div>

                                                {Object.values(selectedImages).some(value => value) && (
                                                    <div className="flex gap-3">
                                                        <button
                                                            onClick={() => {
                                                                const newImages = images.filter((_, index) => !selectedImages[index]);
                                                                setImages(newImages);
                                                                setSelectedImages({});
                                                                setSelectAll(false);
                                                            }}
                                                            className="px-6 py-2 bg-gradient-to-r from-red-500 to-pink-600 text-white text-sm font-semibold rounded-xl hover:from-red-600 hover:to-pink-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
                                                        >
                                                            Delete Selected
                                                        </button>
                                                        <button
                                                            onClick={addSelectedToQueue}
                                                            className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-semibold rounded-xl hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
                                                        >
                                                            Add to Queue
                                                        </button>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Images Grid */}
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-2 gap-6">
                                                {images.map((img, i) => (
                                                    <div
                                                        key={i}
                                                        onClick={() => handleSelectImage(i)}
                                                        className={`group relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-2xl ${selectedImages[i]
                                                            ? 'ring-4 ring-blue-500 transform scale-95 shadow-2xl'
                                                            : 'hover:transform hover:scale-105 shadow-lg'
                                                            }`}
                                                    >
                                                        {/* Checkbox */}
                                                        <div className="absolute top-3 left-3 z-20">
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedImages[i] || false}
                                                                onChange={(e) => {
                                                                    e.stopPropagation();
                                                                    handleSelectImage(i);
                                                                }}
                                                                className="w-5 h-5 text-blue-600 bg-white/90 border-2 border-gray-300 rounded focus:ring-blue-500 shadow-lg"
                                                            />
                                                        </div>

                                                        {/* Image */}
                                                        <div className="relative">
                                                            <img
                                                                src={img.preview}
                                                                alt=""
                                                                className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
                                                            />
                                                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                                            {selectedImages[i] && (
                                                                <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                                                                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                                                                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                                        </svg>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Caption */}
                                                        <div className="p-4 bg-white dark:bg-gray-800">
                                                            <textarea
                                                                placeholder={t('upload.caption')}
                                                                className={`w-full px-3 py-2 text-sm rounded-lg border-2 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none ${darkMode
                                                                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                                                    : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500'
                                                                    }`}
                                                                value={imageCaptions[i] || ''}
                                                                onClick={(e) => e.stopPropagation()}
                                                                onChange={(e) => setImageCaptions({ ...imageCaptions, [i]: e.target.value })}
                                                                rows="2"
                                                            />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                            {/* Videos Tab */}
                            {activeTab === 'Videos' && (
                                <div className="space-y-8">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-gradient-to-r from-red-500 to-pink-600 rounded-xl">
                                            <FilmIcon className="h-7 w-7 text-white" />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                                                {t('upload.videos.title')}
                                            </h2>
                                            <p className="text-gray-500 dark:text-gray-400 text-sm">{t('upload.videos.description')}</p>
                                        </div>
                                    </div>

                                    {/* Video Dropzone */}
                                    <div {...getVideoProps()} className={`group relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 hover:scale-[1.02] ${darkMode
                                        ? 'border-gray-600 hover:border-red-400 bg-gradient-to-br from-gray-800/50 to-gray-700/50 hover:from-red-900/20 hover:to-pink-900/20'
                                        : 'border-gray-300 hover:border-red-500 bg-gradient-to-br from-red-50/50 to-pink-50/50 hover:from-red-100/70 hover:to-pink-100/70'
                                        }`}>
                                        <input {...getVideoInputProps()} />
                                        <div className="space-y-4">
                                            <div className="relative">
                                                <CloudArrowUpIcon className={`h-16 w-16 mx-auto transition-all duration-300 group-hover:scale-110 ${darkMode ? 'text-gray-500 group-hover:text-red-400' : 'text-gray-400 group-hover:text-red-500'
                                                    }`} />
                                                <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-pink-600 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-xl"></div>
                                            </div>
                                            <div>
                                                <p className={`text-lg font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                    {t('upload.videos.dropzone')}
                                                </p>
                                                <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                                                    or click to browse
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Videos Grid */}
                                    {videos.length > 0 && (
                                        <div className="space-y-6">
                                            {/* Selection Controls */}
                                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 bg-gray-50/50 dark:bg-gray-700/30 rounded-xl">
                                                <div className="flex items-center gap-3">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectAllVideos}
                                                        onChange={handleSelectAllVideos}
                                                        className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                                    />
                                                    <span className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                        Select All ({videos.length} items)
                                                    </span>
                                                </div>

                                                {Object.values(selectedVideos).some(value => value) && (
                                                    <div className="flex gap-3">
                                                        <button
                                                            onClick={() => {
                                                                const newVideos = videos.filter((_, index) => !selectedVideos[index]);
                                                                setVideos(newVideos);
                                                                setSelectedVideos({});
                                                                setSelectAllVideos(false);
                                                            }}
                                                            className="px-6 py-2 bg-gradient-to-r from-red-500 to-pink-600 text-white text-sm font-semibold rounded-xl hover:from-red-600 hover:to-pink-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
                                                        >
                                                            Delete Selected
                                                        </button>
                                                        <button
                                                            onClick={addSelectedVideosToQueue}
                                                            className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-semibold rounded-xl hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
                                                        >
                                                            Add to Queue
                                                        </button>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Videos Grid */}
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                                {videos.map((video, i) => (
                                                    <div
                                                        key={i}
                                                        onClick={() => handleSelectVideo(i)}
                                                        className={`group relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-2xl ${selectedVideos[i]
                                                            ? 'ring-4 ring-red-500 transform scale-95 shadow-2xl'
                                                            : 'hover:transform hover:scale-105 shadow-lg'
                                                            }`}
                                                    >
                                                        {/* Checkbox */}
                                                        <div className="absolute top-3 left-3 z-20">
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedVideos[i] || false}
                                                                onChange={(e) => {
                                                                    e.stopPropagation();
                                                                    handleSelectVideo(i);
                                                                }}
                                                                className="w-5 h-5 text-blue-600 bg-white/90 border-2 border-gray-300 rounded focus:ring-blue-500 shadow-lg"
                                                            />
                                                        </div>

                                                        {/* Video */}
                                                        <div className="relative">
                                                            <video
                                                                src={video.preview}
                                                                className="w-full h-48 object-cover"
                                                                controls
                                                            />
                                                            {selectedVideos[i] && (
                                                                <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
                                                                    <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
                                                                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                                        </svg>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Caption */}
                                                        <div className="p-4 bg-white dark:bg-gray-800">
                                                            <textarea
                                                                placeholder={t('upload.caption')}
                                                                className={`w-full px-3 py-2 text-sm rounded-lg border-2 transition-all duration-200 focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none ${darkMode
                                                                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                                                    : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500'
                                                                    }`}
                                                                value={videoCaptions[i] || ''}
                                                                onClick={(e) => e.stopPropagation()}
                                                                onChange={(e) => setVideoCaptions({ ...videoCaptions, [i]: e.target.value })}
                                                                rows="2"
                                                            />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                            {/* Message */}
                            {/* Messages Tab */}
                            {activeTab === 'Messages' && (
                                <div className="space-y-8">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl">
                                                <ChatBubbleBottomCenterTextIcon className="h-7 w-7 text-white" />
                                            </div>
                                            <div>
                                                <h2 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                                                    {t('upload.messages.title')}
                                                </h2>
                                                <p className="text-gray-500 dark:text-gray-400 text-sm">{t('upload.messages.description')}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={addMessage}
                                            className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-600 hover:to-emerald-700 transform hover:scale-105 transition-all duration-200 shadow-lg flex items-center gap-2"
                                        >
                                            <PlusIcon className="h-5 w-5" />
                                            {t('upload.messages.addMessage')}
                                        </button>
                                    </div>

                                    <div className="space-y-4">
                                        {messages.map((msg, i) => (
                                            <div key={i} className="group bg-gray-50/50 dark:bg-gray-700/30 rounded-2xl p-6 transition-all duration-200 hover:shadow-lg">
                                                <div className="flex gap-4">
                                                    <div className="flex-1">
                                                        <textarea
                                                            value={msg}
                                                            onChange={e => updateMessage(i, e.target.value)}
                                                            rows="3"
                                                            className={`w-full p-4 rounded-xl border-2 transition-all duration-200 focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none ${darkMode
                                                                ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400'
                                                                : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500'
                                                                }`}
                                                            placeholder={t('upload.messages.placeholder')}
                                                        />
                                                    </div>
                                                    <div className="flex flex-col gap-2">
                                                        <button
                                                            onClick={() => addMessageToQueue(msg, i)}
                                                            className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
                                                        >
                                                            <PlusIcon className="h-5 w-5" />
                                                        </button>
                                                        {messages.length > 1 && (
                                                            <button
                                                                onClick={() => removeMessage(i)}
                                                                className="p-3 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl hover:from-red-600 hover:to-pink-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
                                                            >
                                                                <XMarkIcon className="h-5 w-5" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {/* Document */}
                            {/* Document */}
                            {activeTab === 'Documents' && (
                                <div className="space-y-8">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl">
                                            <DocumentIcon className="h-7 w-7 text-white" />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                                                {t('upload.documents.title')}
                                            </h2>
                                            <p className="text-gray-500 dark:text-gray-400 text-sm">{t('upload.documents.description')}</p>
                                        </div>
                                    </div>

                                    {/* Document Dropzone */}
                                    <div {...getDocumentProps()} className={`group relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 hover:scale-[1.02] ${darkMode
                                        ? 'border-gray-600 hover:border-amber-400 bg-gradient-to-br from-gray-800/50 to-gray-700/50 hover:from-amber-900/20 hover:to-orange-900/20'
                                        : 'border-gray-300 hover:border-amber-500 bg-gradient-to-br from-amber-50/50 to-orange-50/50 hover:from-amber-100/70 hover:to-orange-100/70'
                                        }`}>
                                        <input {...getDocumentInputProps()} />
                                        <div className="space-y-4">
                                            <div className="relative">
                                                <CloudArrowUpIcon className={`h-16 w-16 mx-auto transition-all duration-300 group-hover:scale-110 ${darkMode ? 'text-gray-500 group-hover:text-amber-400' : 'text-gray-400 group-hover:text-amber-500'
                                                    }`} />
                                                <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-600 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-xl"></div>
                                            </div>
                                            <div>
                                                <p className={`text-lg font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                    {t('upload.documents.dropzone')}
                                                </p>
                                                <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                                                    or click to browse
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Documents List */}
                                    {documents.length > 0 && (
                                        <div className="space-y-4">
                                            {documents.map((doc, i) => (
                                                <div key={i} className={`group flex items-center justify-between p-6 rounded-2xl transition-all duration-300 hover:shadow-lg hover:scale-[1.02] ${darkMode ? 'bg-gray-800 hover:bg-gray-700/80' : 'bg-white hover:bg-gray-50 shadow-sm'
                                                    }`}>
                                                    <div className="flex items-center gap-4">
                                                        <div className="p-3 bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl group-hover:scale-105 transition-transform duration-300">
                                                            <DocumentIcon className="h-6 w-6 text-white" />
                                                        </div>
                                                        <div>
                                                            <p className={`font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                                {doc.name}
                                                            </p>
                                                            <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                                                                Document • Ready to upload
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => addDocumentToQueue(doc, i)}
                                                        className="px-6 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white text-sm font-semibold rounded-xl hover:from-amber-600 hover:to-orange-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
                                                    >
                                                        {t('upload.add')}
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                </div>
                            )}


                            {activeTab === 'Audio' && (
                                <div className="space-y-8">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-gradient-to-r from-purple-500 to-violet-600 rounded-xl">
                                            <MicrophoneIcon className="h-7 w-7 text-white" />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">
                                                {t('upload.audio.title')}
                                            </h2>
                                            <p className="text-gray-500 dark:text-gray-400 text-sm">{t('upload.audio.description')}</p>
                                        </div>
                                    </div>

                                    {/* Audio Dropzone */}
                                    <div {...getAudioProps()} className={`group relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 hover:scale-[1.02] ${darkMode
                                        ? 'border-gray-600 hover:border-purple-400 bg-gradient-to-br from-gray-800/50 to-gray-700/50 hover:from-purple-900/20 hover:to-violet-900/20'
                                        : 'border-gray-300 hover:border-purple-500 bg-gradient-to-br from-purple-50/50 to-violet-50/50 hover:from-purple-100/70 hover:to-violet-100/70'
                                        }`}>
                                        <input {...getAudioInputProps()} />
                                        <div className="space-y-4">
                                            <div className="relative">
                                                <CloudArrowUpIcon className={`h-16 w-16 mx-auto transition-all duration-300 group-hover:scale-110 ${darkMode ? 'text-gray-500 group-hover:text-purple-400' : 'text-gray-400 group-hover:text-purple-500'
                                                    }`} />
                                                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-violet-600 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-xl"></div>
                                            </div>
                                            <div>
                                                <p className={`text-lg font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                    {t('upload.audio.dropzone')}
                                                </p>
                                                <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                                                    or click to browse
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Audio List */}
                                    {audios.length > 0 && (
                                        <div className="space-y-4">
                                            {audios.map((audio, i) => (
                                                <div key={i} className={`group relative rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-[1.02] ${darkMode ? 'bg-gray-800 hover:bg-gray-700/80' : 'bg-white hover:bg-gray-50 shadow-sm'
                                                    }`}>
                                                    <div className="p-6">
                                                        <div className="flex items-center gap-4 mb-4">
                                                            <div className="p-3 bg-gradient-to-r from-purple-500 to-violet-600 rounded-xl group-hover:scale-105 transition-transform duration-300">
                                                                <MicrophoneIcon className="h-6 w-6 text-white" />
                                                            </div>
                                                            <div className="flex-1">
                                                                <p className={`font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                                    {audio.file.name}
                                                                </p>
                                                                <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                                                                    Audio • Ready to upload
                                                                </p>
                                                            </div>
                                                            <button
                                                                onClick={() => addAudioToQueue(audio, i)}
                                                                className="px-6 py-2 bg-gradient-to-r from-purple-500 to-violet-600 text-white text-sm font-semibold rounded-xl hover:from-purple-600 hover:to-violet-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
                                                            >
                                                                {t('upload.add')}
                                                            </button>
                                                        </div>
                                                        <div className={`rounded-xl overflow-hidden ${darkMode ? 'bg-gray-700/50' : 'bg-gray-100/50'}`}>
                                                            <audio
                                                                controls
                                                                className={`w-full h-12 ${darkMode ? 'audio-dark' : 'audio-light'}`}
                                                                style={{
                                                                    background: 'transparent',
                                                                    outline: 'none'
                                                                }}
                                                            >
                                                                <source src={audio.preview} type={audio.file.type} />
                                                                {t('upload.audioNotSupported')}
                                                            </audio>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Audio */}
                            {/* Audio Section */}


                        </div>
                    </div>


                </div>
                {/* Right Panel - Upload Queue */}
                <div className={`w-2/3 rounded-2xl h-[calc(100vh-56px)] flex flex-col shadow-xl backdrop-blur-sm border transition-all duration-300 ${darkMode ? 'bg-gray-800/95 border-gray-700/50 shadow-2xl' : 'bg-white/95 border-gray-200/60 shadow-gray-200/50'}`}>
                    {/* Upload Queue Section */}
                    <div className="flex-1">
                        <section className={`${darkMode ? 'bg-gradient-to-br from-gray-800/80 to-gray-900/60' : 'bg-gradient-to-br from-white to-gray-50/80'} rounded-2xl  border overflow-hidden mb-8 ${darkMode ? 'border-gray-700/40' : 'border-gray-200/40'} flex flex-col `}>
                            <div className="flex border-b-2  border-gray-200 items-center justify-between p-2  pb-6 flex-shrink-0">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
                                        <ArrowsUpDownIcon className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <h2 className={`text-2xl font-bold bg-gradient-to-r ${darkMode ? 'from-indigo-400 to-purple-400' : 'from-indigo-600 to-purple-600'} bg-clip-text text-transparent`}>
                                            {t('upload.queue.title')}
                                        </h2>
                                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                            Drag to reorder files
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1   max-h-[500px] overflow-y-auto p-2 ">
                                {uploadQueue.length === 0 ? (
                                    <div className="text-center py-16">
                                        <div className={`p-6 ${darkMode ? 'bg-gray-700/50' : 'bg-gray-100/80'} rounded-2xl w-20 h-20 mx-auto mb-6 flex items-center justify-center backdrop-blur-sm`}>
                                            <ArrowsUpDownIcon className={`h-10 w-10 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                                        </div>
                                        <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} font-medium text-lg mb-2`}>
                                            {t('upload.queue.empty')}
                                        </p>
                                        <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                                            Add files to get started
                                        </p>
                                    </div>
                                ) : (
                                    <DndContext
                                        sensors={sensors}
                                        collisionDetection={closestCenter}
                                        onDragEnd={handleDragEnd}
                                        modifiers={[]}
                                    >
                                        <SortableContext items={uploadQueue.map(item => item.id)} strategy={verticalListSortingStrategy}>
                                            <div className="space-y-3">
                                                {uploadQueue.map((item) => (
                                                    <SortableItem
                                                        key={item.id}
                                                        id={item.id}
                                                        item={item}
                                                        onRemove={() => removeFromQueue(item.id)}
                                                    />
                                                ))}
                                            </div>
                                        </SortableContext>
                                    </DndContext>
                                )}
                            </div>
                        </section>
                    </div>

                    {/* Submit */}
                    <div className="px-8 pb-8 flex-shrink-0">
                        <button
                            onClick={handleSubmit}
                            disabled={!uploadQueue.length || loading}
                            className={`w-full py-4 px-8 rounded-xl font-semibold text-white shadow-lg transition-all duration-300 transform ${loading || !uploadQueue.length
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]'
                                }`}
                        >
                            {loading ? t('upload.loading') : t('upload.sendQueue')}
                        </button>
                    </div>
                </div>

            </div>



        </>
    )
}
function SortableItem({ id, item, onRemove }) {
    const { darkMode } = useApp()
    const { t } = useTranslation()
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({
        id: id,
        data: {
            type: 'item',
            item: item
        }
    })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 1 : 0,
        touchAction: 'none'
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`group relative flex items-center justify-between p-1.5 rounded-xl transition-all duration-300 backdrop-blur-sm border ${darkMode
                ? 'bg-gradient-to-r from-gray-700/60 to-gray-800/40 border-gray-600/40 hover:from-gray-700/80 hover:to-gray-800/60'
                : 'bg-gradient-to-r from-gray-50/80 to-white/60 border-gray-200/60 hover:from-gray-100/60 hover:to-white/80'
                } ${isDragging
                    ? 'shadow-2xl ring-2 ring-indigo-500/50 scale-[1.02]'
                    : 'shadow-md hover:shadow-lg hover:scale-[1.01]'
                }`}
        >
            <div
                {...listeners}
                {...attributes}
                className="flex items-center cursor-move p-2 rounded-lg hover:bg-gray-200/20 transition-colors duration-200"
            >
                <ArrowsUpDownIcon className={`h-5 w-5 ${darkMode ? 'text-indigo-400' : 'text-indigo-500'}`} />
            </div>

            <div className="flex items-center gap-4 flex-1">
                {item.type === 'image' && (item.existingFile ?
                    <div className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 rounded-xl shadow-sm">
                        <PhotoIcon className="w-7 h-7 text-blue-600 dark:text-blue-400" />
                    </div> :
                    <img src={item.preview} className="w-10 h-10 object-cover rounded-xl shadow-sm border border-gray-200/40 dark:border-gray-600/40" alt="" />
                )}
                {item.type === 'audio' &&
                    <div className="w-14 h-14 flex items-center justify-center bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30 rounded-xl shadow-sm">
                        <MusicalNoteIcon className="w-7 h-7 text-purple-600 dark:text-purple-400" />
                    </div>
                }
                {item.type === 'video' &&
                    <div className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/30 dark:to-red-800/30 rounded-xl shadow-sm">
                        <FilmIcon className="w-7 h-7 text-red-600 dark:text-red-400" />
                    </div>
                }
                {item.type === 'message' &&
                    <div className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30 rounded-xl shadow-sm">
                        <ChatBubbleBottomCenterTextIcon className="w-7 h-7 text-green-600 dark:text-green-400" />
                    </div>
                }
                {item.type === 'document' &&
                    <div className="w-14 h-14 flex items-center justify-center bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/30 dark:to-orange-800/30 rounded-xl shadow-sm">
                        <DocumentIcon className="w-7 h-7 text-orange-600 dark:text-orange-400" />
                    </div>
                }

                <div className="flex-1 flex gap-5 min-w-0">
                    <p className={`font-semibold truncate text-base ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {
                            item.type === 'media' && item.content
                        }
                        {item.type === 'message'
                            ? (item.content?.length > 30 ? `${item.content.substring(0, 30)}...` : item.content)
                            : (item.existingFile ? item.name : item.file.name)?.length > 25
                                ? `${(item.existingFile ? item.name : item.file.name).substring(0, 25)}...`
                                : (item.existingFile ? item.name : item.file.name)
                        }
                    </p>
                    <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {t(`upload.queue.${item.type}`)}
                        {item.existingFile && ' (Existing)'}
                    </p>
                </div>
            </div>

            <button
                onClick={() => onRemove(id)}
                className="opacity-0 group-hover:opacity-100 p-2.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-xl transition-all duration-200 ml-3"
            >
                <XMarkIcon className="h-5 w-5 text-red-500" />
            </button>
        </div>
    )
}

