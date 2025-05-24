import React, { useState, useCallback, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useDropzone } from 'react-dropzone'
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
    MicrophoneIcon
    
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
        addDocumentToQueue
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




    // Replace the input fields with textareas in your JSX
    return (
        <div className="grid grid-cols-1 gap-6 p-6">
            {/* Left Column */}
            <div className="space-y-6 w-full">
                {/* Images Section */}
                <section className={`p-6 rounded-lg shadow-sm ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                    <div className="flex items-center gap-2 mb-4">
                        <PhotoIcon className={`h-6 w-6 ${darkMode ? 'text-blue-400' : 'text-blue-500'}`} />
                        <h2 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {t('upload.images.title')}
                        </h2>
                    </div>

                    <div {...getImageProps()} className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${darkMode ? 'border-gray-600 hover:border-blue-400 hover:bg-gray-700/50' : 'border-gray-300 hover:border-blue-500 hover:bg-blue-50'}`}>
                        <input {...getImageInputProps()} />
                        <CloudArrowUpIcon className={`h-12 w-12 mx-auto ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                        <p className={`mt-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {t('upload.images.dropzone')}
                        </p>
                    </div>


                    {images.length > 0 && (
                        <>
                            <div className="flex justify-between items-center mb-4">
                                <div className="flex items-center gap-2 mt-4">
                                    <input
                                        type="checkbox"
                                        checked={selectAll}
                                        onChange={handleSelectAll}
                                        className="w-4 h-4 text-blue-600"
                                    />
                                    <span className={`text-sm ${darkMode ? 'text-white' : 'text-gray-700'}`}>
                                        Select All
                                    </span>
                                </div>
                                <div className="flex gap-2 mt-4">
                                    {Object.values(selectedImages).some(value => value) && (
                                        <>
                                            <button
                                                onClick={() => {
                                                    const newImages = images.filter((_, index) => !selectedImages[index]);
                                                    setImages(newImages);
                                                    setSelectedImages({});
                                                    setSelectAll(false);
                                                }}
                                                className="px-4 py-2 bg-red-500 text-white text-sm rounded hover:bg-red-600 animate-fadeUp"
                                            >
                                                Delete Selected
                                            </button>
                                            <button
                                                onClick={addSelectedToQueue}
                                                className="px-4 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 animate-fadeUp"
                                            >
                                                Add Selected to Queue
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                            <div className="mt-4 grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {images.map((img, i) => (
                                    <div
                                        key={i}
                                        onClick={() => handleSelectImage(i)}
                                        className={`relative rounded-lg overflow-hidden cursor-pointer transition-all duration-200 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'
                                            } ${selectedImages[i] ?
                                                'ring-2 ring-blue-500 opacity-80 transform scale-[0.98]' :
                                                'hover:shadow-lg hover:scale-[1.02]'
                                            }`}
                                    >
                                        <div className="absolute top-2 left-2 z-10">
                                            <input
                                                type="checkbox"
                                                checked={selectedImages[i] || false}
                                                onChange={(e) => {
                                                    e.stopPropagation();
                                                    handleSelectImage(i);
                                                }}
                                                className="w-4 h-4 text-blue-600"
                                            />
                                        </div>
                                        <div className={`relative ${selectedImages[i] ? 'after:absolute after:inset-0 after:bg-blue-500/10' : ''}`}>
                                            <img
                                                src={img.preview}
                                                alt=""
                                                className="w-full h-32 object-cover"
                                            />
                                        </div>
                                        <div className="p-2">
                                            <textarea
                                                placeholder={t('upload.caption')}
                                                className={`w-full px-2 py-1 text-sm rounded ${darkMode ? 'bg-gray-600 text-white' : 'bg-white'}`}
                                                value={imageCaptions[i] || ''}
                                                onClick={(e) => e.stopPropagation()}
                                                onChange={(e) => setImageCaptions({ ...imageCaptions, [i]: e.target.value })}
                                                rows="2"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </section>

                {/* Videos Section */}
                <section className={`p-6 rounded-lg shadow-sm ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                    <div className="flex items-center gap-2 mb-4">
                        <FilmIcon className={`h-6 w-6 ${darkMode ? 'text-red-400' : 'text-red-500'}`} />
                        <h2 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {t('upload.videos.title')}
                        </h2>
                    </div>

                    <div {...getVideoProps()} className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${darkMode ? 'border-gray-600 hover:border-red-400 hover:bg-gray-700/50' : 'border-gray-300 hover:border-red-500 hover:bg-red-50'}`}>
                        <input {...getVideoInputProps()} />
                        <CloudArrowUpIcon className={`h-12 w-12 mx-auto ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                        <p className={`mt-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {t('upload.videos.dropzone')}
                        </p>
                    </div>


                    {videos.length > 0 && (
                        <>
                            <div className="flex justify-between items-center mb-4">
                                <div className="flex items-center gap-2 mt-4">
                                    <input
                                        type="checkbox"
                                        checked={selectAllVideos}
                                        onChange={handleSelectAllVideos}
                                        className="w-4 h-4 text-blue-600"
                                    />
                                    <span className={`text-sm ${darkMode ? 'text-white' : 'text-gray-700'}`}>
                                        Select All
                                    </span>
                                </div>
                                <div className="flex gap-2 mt-4">
                                    {Object.values(selectedVideos).some(value => value) && (
                                        <>
                                            <button
                                                onClick={() => {
                                                    const newVideos = videos.filter((_, index) => !selectedVideos[index]);
                                                    setVideos(newVideos);
                                                    setSelectedVideos({});
                                                    setSelectAllVideos(false);
                                                }}
                                                className="px-4 py-2 bg-red-500 text-white text-sm rounded hover:bg-red-600 animate-fadeUp"
                                            >
                                                Delete Selected
                                            </button>
                                            <button
                                                onClick={addSelectedVideosToQueue}
                                                className="px-4 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 animate-fadeUp"
                                            >
                                                Add Selected to Queue
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                            <div className="mt-4 grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {videos.map((video, i) => (
                                    <div
                                        key={i}
                                        onClick={() => handleSelectVideo(i)}
                                        className={`relative rounded-lg overflow-hidden cursor-pointer transition-all duration-200 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'
                                            } ${selectedVideos[i]
                                                ? 'ring-2 ring-blue-500 opacity-80 transform scale-[0.98]'
                                                : 'hover:shadow-lg hover:scale-[1.02]'
                                            }`}
                                    >
                                        <div className="absolute top-2 left-2 z-10">
                                            <input
                                                type="checkbox"
                                                checked={selectedVideos[i] || false}
                                                onChange={(e) => {
                                                    e.stopPropagation();
                                                    handleSelectVideo(i);
                                                }}
                                                className="w-4 h-4 text-blue-600"
                                            />
                                        </div>
                                        <video
                                            src={video.preview}
                                            className="w-full h-32 object-cover"
                                            controls
                                        />
                                        <div className="p-2">
                                            <textarea
                                                placeholder={t('upload.caption')}
                                                className={`w-full px-2 py-1 text-sm rounded ${darkMode ? 'bg-gray-600 text-white' : 'bg-white'}`}
                                                value={videoCaptions[i] || ''}
                                                onClick={(e) => e.stopPropagation()}
                                                onChange={(e) => setVideoCaptions({ ...videoCaptions, [i]: e.target.value })}
                                                rows="2"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </section>

                {/* Other sections remain the same */}
                {/* Messages */}
                <section className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg shadow-sm`}>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <ChatBubbleBottomCenterTextIcon className={`h-6 w-6 ${darkMode ? 'text-green-400' : 'text-green-500'}`} />
                            <h2 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{t('upload.messages.title')}</h2>
                        </div>
                        <button onClick={addMessage} className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600">
                            <PlusIcon className="h-5 w-5" />
                        </button>
                    </div>
                    <div className="space-y-4">
                        {messages.map((msg, i) => (
                            <div key={i} className="flex gap-2">
                                <textarea value={msg} onChange={e => updateMessage(i, e.target.value)} rows="2" className={`${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-100 border-gray-500'} flex-1 p-3 rounded-md`} placeholder={t('upload.messages.placeholder')} />
                                <button onClick={() => addMessageToQueue(msg, i)} className="px-2 bg-green-500 text-white rounded-md hover:bg-green-600">
                                    <PlusIcon className="h-5 w-5" />
                                </button>
                                {messages.length > 1 && (
                                    <button onClick={() => removeMessage(i)} className="text-red-500 hover:text-red-600">
                                        <XMarkIcon className="h-5 w-5" />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </section>

                {/* Documents Section */}
                <section className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg shadow-sm`}>
                    <div className="flex items-center gap-2 mb-4">
                        <DocumentIcon className={`h-6 w-6 ${darkMode ? 'text-yellow-400' : 'text-yellow-500'}`} />
                        <h2 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{t('upload.documents.title')}</h2>
                    </div>

                    <div {...getDocumentProps()} className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${darkMode ? 'border-gray-600 hover:border-yellow-400 hover:bg-gray-700/50' : 'border-gray-300 hover:border-yellow-500 hover:bg-yellow-50'}`}>
                        <input {...getDocumentInputProps()} />
                        <CloudArrowUpIcon className={`h-12 w-12 mx-auto ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                        <p className={`mt-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {t('upload.documents.dropzone')}
                        </p>
                    </div>

                    {documents.length > 0 && (
                        <div className="mt-4 space-y-2">
                            {documents.map((doc, i) => (
                                <div key={i} className={`flex items-center justify-between p-2 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                                    <div className="flex items-center gap-2">
                                        <DocumentIcon className={`h-5 w-5 ${darkMode ? 'text-yellow-400' : 'text-yellow-500'}`} />
                                        <p className={`text-sm truncate ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                            {doc.name}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => addDocumentToQueue(doc, i)}
                                        className="px-3 py-1 bg-yellow-500 text-white text-sm rounded hover:bg-yellow-600"
                                    >
                                        {t('upload.add')}
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* Audio Section */}
                <section className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg shadow-sm`}>
                    <div className="flex items-center gap-2 mb-4">
                        <MicrophoneIcon className={`h-6 w-6 ${darkMode ? 'text-purple-400' : 'text-purple-500'}`} />
                        <h2 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{t('upload.audio.title')}</h2>
                    </div>

                    <div {...getAudioProps()} className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${darkMode ? 'border-gray-600 hover:border-purple-400 hover:bg-gray-700/50' : 'border-gray-300 hover:border-purple-500 hover:bg-purple-50'}`}>
                        <input {...getAudioInputProps()} />
                        <CloudArrowUpIcon className={`h-12 w-12 mx-auto ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                        <p className={`mt-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {t('upload.audio.dropzone')}
                        </p>
                    </div>

                    {audios.length > 0 && (
                        <div className="mt-4 grid grid-cols-1 gap-4">
                            {audios.map((audio, i) => (
                                <div key={i} className={`relative rounded-lg overflow-hidden ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                                    <div className="p-2">
                                        <p className={`text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                            {audio.file.name}
                                        </p>
                                        <audio controls className="w-full mb-2">
                                            <source src={audio.preview} type={audio.file.type} />
                                            {t('upload.audioNotSupported')}
                                        </audio>
                                        <div className="flex justify-end mt-2">
                                            <button
                                                onClick={() => addAudioToQueue(audio, i)}
                                                className="px-3 py-1 bg-purple-500 text-white text-sm rounded hover:bg-purple-600"
                                            >
                                                {t('upload.add')}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
                {/* Upload Queue Section */}
                <section className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg shadow-sm overflow-hidden mb-6`}>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <ArrowsUpDownIcon className={`h-6 w-6 ${darkMode ? 'text-indigo-400' : 'text-indigo-500'}`} />
                            <h2 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{t('upload.queue.title')}</h2>
                        </div>

                    </div>

                    {uploadQueue.length === 0 ? (
                        <p className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {t('upload.queue.empty')}
                        </p>
                    ) : (
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleDragEnd}
                            modifiers={[]}
                        >
                            <SortableContext items={uploadQueue.map(item => item.id)} strategy={verticalListSortingStrategy}>
                                {uploadQueue.map((item) => (
                                    <SortableItem
                                        key={item.id}
                                        id={item.id}
                                        item={item}
                                        onRemove={() => removeFromQueue(item.id)}
                                    />
                                ))}
                            </SortableContext>
                        </DndContext>
                    )}
                </section>

                {/* Submit */}
                <button onClick={handleSubmit} disabled={!uploadQueue.length || loading} className={`w-fit py-3 px-2 rounded-md text-white ${darkMode ? 'bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700' : 'bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 '}`}>
                    {loading ? t('upload.loading') : t('upload.sendQueue')}
                </button>
            </div>

        </div>
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
        touchAction: 'none' // This helps with touch devices
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`flex items-center justify-between p-3 rounded-lg mt-2 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'
                } ${isDragging ? 'shadow-lg ring-2 ring-blue-500' : ''
                }`}
        >
            <div
                {...listeners}
                {...attributes}
                className="flex items-center cursor-move"
            >
                <ArrowsUpDownIcon className={`h-6 w-6 mr-2 ${darkMode ? 'text-yellow-400' : 'text-yellow-500'}`} />
            </div>
            <div className="flex items-center gap-3 flex-1">
                {item.type === 'image' && (item.existingFile ?
                    <div className="w-16 h-16 flex items-center justify-center bg-blue-100 rounded">
                        <PhotoIcon className="w-8 h-8 text-blue-500" />
                    </div> :
                    <img src={item.preview} className="w-16 h-16 object-cover rounded" alt="" />
                )}
                {item.type === 'audio' && <div className="w-16 h-16 flex items-center justify-center bg-purple-100 rounded"><MusicalNoteIcon className="w-8 h-8 text-purple-500" /></div>}
                {item.type === 'video' && <div className="w-16 h-16 flex items-center justify-center bg-red-100 rounded"><FilmIcon className="w-8 h-8 text-red-500" /></div>}
                {item.type === 'message' && <div className="w-16 h-16 flex items-center justify-center bg-green-100 rounded"><ChatBubbleBottomCenterTextIcon className="w-8 h-8 text-green-500" /></div>}
                {item.type === 'document' && <div className="w-16 h-16 flex items-center justify-center bg-orange-100 rounded"><DocumentIcon className="w-8 h-8 text-orange-500" /></div>}

                <div className="flex-1">
                    <p className={`font-medium truncate max-w-[200px] ${darkMode ? 'text-white' : 'text-gray-900'}`}>
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
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {t(`upload.queue.${item.type}`)}
                        {item.existingFile && ' (Existing)'}
                    </p>
                </div>
            </div>

            <button onClick={() => onRemove(id)} className="text-red-500 hover:text-red-600">
                <XMarkIcon className="h-5 w-5" />
            </button>
        </div>
    )
}

