import React from 'react'
import { TableCellsIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline'
import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useTranslation } from 'react-i18next';

// Inside your component:


export default function Dashboard() {
    const { t } = useTranslation();
    const {darkMode } = useApp()
    const menuItems = [
        {
            title: t('Upload Excel Data'),
            icon: <TableCellsIcon className="w-8 h-8" />,
            description: t('Import data from Excel files'),
            path: '/upload-excel'
        },
        {
            title: t('Upload Media'),
            icon: <ArrowUpTrayIcon className="w-8 h-8" />,
            description: t('Upload images, audio, and messages'),
            path: '/upload-media'
        }
    ]

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
            {menuItems.map((item, index) => (
                <Link
                    key={index}
                    to={item.path}
                    className={`p-6 rounded-lg shadow-sm transition-all hover:scale-105 ${
                        darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'
                    }`}
                >
                    <div className={`${darkMode ? 'text-blue-400' : 'text-blue-500'}`}>
                        {item.icon}
                    </div>
                    <h2 className={`text-xl font-semibold mt-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {item.title}
                    </h2>
                    <p className={`mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {item.description}
                    </p>
                </Link>
            ))}
        </div>
    )
}