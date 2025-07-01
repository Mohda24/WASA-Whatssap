import React from 'react';
import { useApp } from '../../context/AppContext';
import { useTranslation } from 'react-i18next';

const BotToggleSwitch = () => {
    const { botEnabled, botStatusLoading, toggleBotStatus, darkMode, isRTL } = useApp();
    const {t}=useTranslation()

    const handleToggle = async () => {
        if (!botStatusLoading) {
            await toggleBotStatus();
        }
    };

    



    return (
        <div
            className={`flex items-center justify-between p-4 rounded-lg shadow ${
                darkMode ? 'bg-gray-800' : 'bg-white'
            } ${isRTL ? 'flex-row-reverse' : ''}`}
            dir={isRTL ? 'rtl' : 'ltr'}
        >
            <div className={`flex flex-col ${isRTL ? 'items-end' : 'items-start'}`}>
                <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {t('whatsappSender.botStatus.title')}
                </h3>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {botEnabled ? t('whatsappSender.botStatus.descriptionOn') : t('whatsappSender.botStatus.descriptionOff')}

                </p>
            </div>

            <div className="flex items-center">
                {botStatusLoading && (
                    <div className={`w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin ${isRTL ? 'ml-3' : 'mr-3'}`} />
                )}

<button
    onClick={handleToggle}
    disabled={botStatusLoading}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        ${botEnabled
            ? 'bg-blue-600'
            : darkMode
                ? 'bg-gray-700'
                : 'bg-gray-200'
        }
        ${botStatusLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
    `}
>
    <span
        className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-transform duration-300
            ${isRTL
                ? botEnabled
                    ? 'right-1 translate-x-0'
                    : 'left-1 translate-x-0'
                : botEnabled
                    ? 'translate-x-5 left-1'
                    : 'translate-x-0 left-1'
            }
        `}
    />
</button>




            </div>
        </div>
    );
};

export default BotToggleSwitch;
