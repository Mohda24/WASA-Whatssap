import React from 'react'
import { useApp } from '../../context/AppContext'
import { useTranslation } from 'react-i18next'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'

export default function ResetDatabaseModal({ isOpen, onClose }) {
    const { darkMode, resetDatabase } = useApp()
    const { t } = useTranslation()

    if (!isOpen) return null

    const handleReset = async () => {
        await resetDatabase()
        onClose()
    }

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className={`
        ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}
        rounded-2xl p-6 max-w-sm w-full mx-4 shadow-xl
        transform transition-all duration-300 scale-100
      `}>
                <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                        <ExclamationTriangleIcon className="h-6 w-6 text-yellow-500" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold mb-2">
                            {t('resetDatabase.title', 'Reset Database')}
                        </h3>
                        <p className={`
              ${darkMode ? 'text-gray-300' : 'text-gray-600'}
              text-sm mb-6
            `}>
                            {t('resetDatabase.message', 'Are you sure you want to reset the database? This will delete all phone numbers and cannot be undone.')}
                        </p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={onClose}
                                className={`
                  px-4 py-2 rounded-lg text-sm font-medium
                  ${darkMode
                                        ? 'text-gray-300 hover:bg-gray-700'
                                        : 'text-gray-600 hover:bg-gray-100'
                                    }
                  transition-colors duration-200
                `}
                            >
                                {t('resetDatabase.cancel', 'Cancel')}
                            </button>
                            <button
                                onClick={handleReset}
                                className="px-4 py-2 rounded-lg text-sm font-medium
                  bg-gradient-to-r from-yellow-400 to-orange-500 
                  text-white hover:shadow-lg hover:shadow-orange-500/20
                  transition-all duration-200"
                            >
                                {t('resetDatabase.confirm', 'Reset Database')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}