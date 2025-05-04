import { useApp } from '../context/AppContext'
import React, { useState } from 'react'
import { QrCodeIcon, CheckCircleIcon, PowerIcon } from '@heroicons/react/24/outline'
import { useTranslation } from 'react-i18next'

function QRCodeScanner() {
    const { isConnected, qrCode, isLoading, darkMode,setIsConnected } = useApp()
    const { t } = useTranslation()
    const [showLogoutModal, setShowLogoutModal] = useState(false)

    const handleLogout = async () => {
        try {
            setShowLogoutModal(false)
            const result = await window.api.logoutWhatsApp()
            if (result.success) {
                localStorage.setItem('whatsappConnection', 'disconnected')
                if (setIsConnected) {
                    setIsConnected(false)
                }
            } else {
                console.error('Logout failed:', result.error)
            }
        } catch (error) {
            console.error(t('navigation.logoutError'), error)
        }
    }

    return (
        <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
                <QrCodeIcon className={`h-7 w-7 ${darkMode ? 'text-blue-400' : 'text-blue-500'}`} />
                <h2 className={`text-xl font-semibold transition-colors ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {t('qrScanner.title')}
                </h2>
            </div>

            {isConnected ? (
                <div className={`flex items-center justify-center p-8 rounded-lg ${darkMode ? 'bg-green-900/20' : 'bg-green-50'}`}>
                    <div className="text-center">
                        <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
                        <p className={`text-lg font-medium ${darkMode ? 'text-green-400' : 'text-green-700'}`}>
                            {t('qrScanner.connected.title')}
                        </p>
                        <p className={`text-sm mt-2 ${darkMode ? 'text-green-400/80' : 'text-green-600'}`}>
                            {t('qrScanner.connected.description')}
                        </p>
                        <button
                            onClick={() => setShowLogoutModal(true)}
                            className={`
                                mt-6 flex items-center px-4 py-3 rounded-xl mx-auto
                                transition-all duration-300 group
                                bg-gradient-to-r from-red-400 to-rose-500 
                                text-white hover:shadow-lg hover:shadow-red-500/20
                            `}
                        >
                            <PowerIcon className="h-5 w-5 mr-3 group-hover:rotate-90 transition-transform duration-300" />
                            <span className="font-medium">{t('navigation.logout')}</span>
                        </button>
                    </div>
                </div>
            ) : qrCode ? (
                <div className="space-y-4">
                    <div className="flex justify-center">
                        <div className={`p-4 rounded-lg shadow-md ${darkMode ? 'bg-gray-700' : 'bg-white'}`}>
                            <img src={qrCode} alt={t('qrScanner.scanning.qrCodeAlt')} />
                        </div>
                    </div>
                    <div className="text-center space-y-2">
                        <p className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                            {t('qrScanner.scanning.title')}
                        </p>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {t('qrScanner.scanning.description')}
                        </p>
                    </div>
                </div>
            ) : (
                <div className={`flex items-center justify-center p-8 rounded-lg ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4" />
                        <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            {isLoading ? t('qrScanner.waiting.checking') : t('qrScanner.waiting.qrCode')}
                        </p>
                    </div>
                </div>
            )}

            {showLogoutModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className={`
                        ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}
                        rounded-2xl p-6 max-w-sm w-full mx-4 shadow-xl
                        transform transition-all duration-300 scale-100
                    `}>
                        <h3 className="text-lg font-semibold mb-2">
                            {t('navigation.logoutModal.title')}
                        </h3>
                        <p className={`
                            ${darkMode ? 'text-gray-300' : 'text-gray-600'}
                            text-sm mb-6
                        `}>
                            {t('navigation.logoutModal.message')}
                        </p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setShowLogoutModal(false)}
                                className={`
                                    px-4 py-2 rounded-lg text-sm font-medium
                                    ${darkMode
                                        ? 'text-gray-300 hover:bg-gray-700'
                                        : 'text-gray-600 hover:bg-gray-100'
                                    }
                                    transition-colors duration-200
                                `}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    handleLogout()
                                    setShowLogoutModal(false)
                                }}
                                className="px-4 py-2 rounded-lg text-sm font-medium
                                    bg-gradient-to-r from-red-400 to-rose-500 
                                    text-white hover:shadow-lg hover:shadow-red-500/20
                                    transition-all duration-200"
                            >
                                {t('navigation.logoutModal.confirm')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default QRCodeScanner
