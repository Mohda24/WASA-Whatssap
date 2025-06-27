import React from 'react';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable
  } from '@dnd-kit/sortable';
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
  import {
    CSS,
  } from '@dnd-kit/utilities';
import {useWhatsAppSender} from '../../context/WhatssapSenderContext';
import {useApp} from "../../context/AppContext"

export const SortableMediaItem = ({ item }) => {
    const { removeMediaItem } = useWhatsAppSender();
    const {darkMode}=useApp()
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: item.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const getMediaIcon = (type) => {
        switch (type) {
            case 'image': return <Camera className="w-4 h-4" />;
            case 'video': return <Video className="w-4 h-4" />;
            case 'audio': return <Mic className="w-4 h-4" />;
            case 'document': return <FileText className="w-4 h-4" />;
            case 'text': return <Mail className="w-4 h-4" />;
            default: return <FileText className="w-4 h-4" />;
        }
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`p-3 rounded-lg border transition-all ${isDragging ? 'opacity-50 scale-105' : 'opacity-100'
                } ${darkMode
                    ? 'bg-gray-800 border-gray-700 hover:bg-gray-750'
                    : 'bg-white border-gray-200 hover:bg-gray-50'
                }`}
        >
            <div className="flex items-center gap-2 mb-2">
                <button
                    {...attributes}
                    {...listeners}
                    className={`cursor-grab active:cursor-grabbing p-1 rounded ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                        }`}
                >
                    <GripVertical className="w-4 h-4" />
                </button>
                {getMediaIcon(item.type)}
                <span className="text-sm font-medium flex-1 truncate">
                    {item.type === 'text' ? item.content : item.name}
                </span>
                <button
                    onClick={() => removeMediaItem(item.id)}
                    className={`p-1 rounded text-red-500 hover:bg-red-100 ${darkMode ? 'hover:bg-red-900/20' : 'hover:bg-red-100'
                        }`}
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>
            {item.caption && (
                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Caption: {item.caption}
                </p>
            )}
        </div>
    );
};