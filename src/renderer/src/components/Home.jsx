import React from 'react'
import { useApp } from '../context/AppContext'
import { useTranslation } from 'react-i18next';
import MessageChart from './MessageChart';
import Statistique from './Statistique';

export default function Home() {
    const { t } = useTranslation();
    const { darkMode } = useApp()


    return (
        <div className="p-6">
            <h1 className={`text-2xl font-bold mb-8 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {t('dashboard.overview')}
            </h1>
            <div className="mb-8">
                <MessageChart />
            </div>
            <div className="mt-8">
                <Statistique />
            </div>
        </div>
    )
}