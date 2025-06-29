import React from 'react';
import { useApp } from '../../context/AppContext';

const BotToggleSwitch = () => {
    const { botEnabled, botStatusLoading, toggleBotStatus,darkMode } = useApp();

    const handleToggle = async () => {
        if (!botStatusLoading) {
            await toggleBotStatus();

        }
    };

    return (
        <div className={`flex items-center justify-between p-4 rounded-lg shadow ${
            darkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
            <div className="flex flex-col">
                <h3 className={`text-lg font-semibold ${
                    darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                    WhatsApp Bot
                </h3>
                <p className={`text-sm ${
                    darkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                    {botEnabled ? 'Bot is active and responding to messages' : 'Bot is disabled'}
                </p>
            </div>
            
            <div className="flex items-center">
                {botStatusLoading && (
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-3"></div>
                )}
                
                <button
                    onClick={handleToggle}
                    disabled={botStatusLoading}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                        botEnabled 
                            ? 'bg-blue-600' 
                            : darkMode ? 'bg-gray-700' : 'bg-gray-200'
                    } ${botStatusLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                    <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            botEnabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                    />
                </button>
            </div>
        </div>
    );
};

export default BotToggleSwitch;