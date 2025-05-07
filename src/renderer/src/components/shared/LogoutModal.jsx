import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../../context/AppContext';
import { ClipboardIcon, CheckIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { resetLicenseKey } from '../../Utils/licence';
import toast from 'react-hot-toast';

export default function LogoutModal({ isOpen, onClose }) {
    const { t } = useTranslation();
    const { darkMode, setIsLoggedIn } = useApp();
    const [copied, setCopied] = useState(false);

    if (!isOpen) return null;

    const handleCopyKey = () => {
        const key = localStorage.getItem('licenseKey');
        if (key) {
            navigator.clipboard.writeText(key);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleLogout = async () => {
        try {
            const key = localStorage.getItem('licenseKey');
            const answer = await resetLicenseKey(key);
            if (answer) {
                localStorage.removeItem('licenseKey');
                toast.success(t('keyReset.successMessage'), { position: 'top-center' });
                setIsLoggedIn(false);
            } else {
                toast.error(t('keyReset.errorMessage'), { position: 'top-center' });
                return
            }
        } catch (error) {
            toast.error(t('keyReset.errorMessage'), { position: 'top-center' });
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className={`w-full max-w-md p-6 rounded-2xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-xl`}>
                <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {t('logout.confirmTitle')}
                </h3>
                
                <div className={`mb-3 flex items-center gap-2 ${darkMode ? 'text-amber-400' : 'text-amber-600'}`}>
                    <ExclamationTriangleIcon className="h-5 w-5" />
                    <p className="text-sm">{t('logout.sensitiveKeyWarning')}</p>
                </div>

                <div className={`flex items-center gap-2 p-3 rounded-lg mb-6 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <input
                        type="text"
                        readOnly
                        value={localStorage.getItem('licenseKey') || ''}
                        className={`flex-1 bg-transparent border-none focus:outline-none ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}
                    />
                    <button
                        onClick={handleCopyKey}
                        className={`p-2 rounded-lg transition-colors ${darkMode
                                ? 'hover:bg-gray-600 text-gray-300'
                                : 'hover:bg-gray-200 text-gray-600'
                            }`}
                        title={t('common.copy')}
                    >
                        {copied ? (
                            <CheckIcon className="h-5 w-5 text-green-500" />
                        ) : (
                            <ClipboardIcon className="h-5 w-5" />
                        )}
                    </button>
                </div>

                <div className="flex gap-3 justify-end">
                    <button
                        onClick={onClose}
                        className={`px-4 py-2 rounded-lg transition-colors ${darkMode
                                ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                            }`}
                    >
                        {t('common.cancel')}
                    </button>
                    <button
                        onClick={handleLogout}
                        className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
                    >
                        {t('common.confirm')}
                    </button>
                </div>
            </div>
        </div>
    );
}