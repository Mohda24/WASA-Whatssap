import React from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { useApp } from '../../context/AppContext'

export default function Modal({ onClose, onSubmit, title, content }) {
  const { darkMode } = useApp()
  
  return (
    <div 
      className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md rounded-lg shadow-xl animate-fadeIn  ${
        darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
      }`}
    >
      {/* Header */}
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-start justify-between">
          <h3 className="text-xl font-semibold leading-6">
            {title}
          </h3>
          <button
            onClick={onClose}
            className={`rounded-full p-1 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
      </div>
      
      {/* Content */}
      <div className="px-6 pb-1">
        <p className="text-base">
          {content}
        </p>
      </div>
      
      {/* Footer with actions */}
      <div className={`px-6 py-4 flex justify-end gap-3 ${darkMode ? 'border-t border-gray-700' : 'border-t border-gray-200'}`}>
        <button
          onClick={onClose}
          className={`px-4 py-2 rounded-md ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
        >
          Cancel
        </button>
        <button
          onClick={() => {
            onSubmit()
            onClose()
          }}
          className={`px-4 py-2 rounded-md ${darkMode ? 'bg-blue-600 hover:bg-blue-500' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
        >
          Confirm
        </button>
      </div>
    </div>
  )
}