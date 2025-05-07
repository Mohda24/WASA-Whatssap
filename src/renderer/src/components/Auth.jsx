import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { verifyLicense } from '../Utils/licence';
import { useApp } from '../context/AppContext';
import { useTranslation } from 'react-i18next';

export default function Auth() {
    const { setKey, darkMode, isRTL } = useApp();
    const { t } = useTranslation();
    const [licenseKey, setLicenseKey] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const isValid = await verifyLicense(licenseKey);
            if (!isValid) throw new Error('Invalid or used license key');

            // success!
            setKey(licenseKey);
            toast.success('License activated!', { position: 'top-center' });
            setLoading(false);
            navigate('/', { replace: true });
        } catch (err) {
            const msg = err.message || 'Verification failed';
            setError(msg);
            toast.error(msg, { position: 'top-center' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-gray-100'} transition-colors`} dir={isRTL ? 'rtl' : 'ltr'}>
            <div className={`w-full max-w-md ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg rounded-2xl p-8`}>
                <h2 className={`text-3xl font-bold text-center ${darkMode ? 'text-gray-100' : 'text-gray-800'} mb-6`}>
                    {t('auth.title')}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="text"
                        value={licenseKey}
                        onChange={(e) => setLicenseKey(e.target.value)}
                        placeholder={t('auth.placeholder')}
                        disabled={loading}
                        required
                        className={`w-full px-4 py-3 rounded-xl ${
                            darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-gray-50 border-gray-300 text-gray-800'
                        } border focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50`}
                    />

                    {error && (
                        <p className="text-red-500 text-center animate-fadeIn">{t('auth.error')}</p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition disabled:opacity-50"
                    >
                        {loading ? t('auth.verifying') : t('auth.submit')}
                    </button>
                </form>

                <p className={`text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'} text-sm mt-4`}>
                    {t('auth.instructions')}
                </p>
            </div>
        </div>
    );
}
