import React, { use, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import {
    QrCodeIcon,
    ArrowUpTrayIcon,
    TableCellsIcon,
    Bars3Icon,
    XMarkIcon,
    HomeIcon,
    PhoneIcon,
    PowerIcon,
    LanguageIcon,
    TrashIcon,
    HomeModernIcon,
    DevicePhoneMobileIcon,
    CloudArrowUpIcon,
    NoSymbolIcon,
    ClockIcon,
    PhoneXMarkIcon,
    


} from '@heroicons/react/24/outline'
import { useTranslation } from 'react-i18next'
import ResetDatabaseModal from './shared/ResetDatabaseModal'
import ThemeSwitch from './ThemeSwitch'
import LogoutModal from './shared/LogoutModal'
import { useEffect } from 'react'

export default function Navigation() {
    const { darkMode, isRTL } = useApp()
    const { t, i18n } = useTranslation()
    const [isSidebarOpen, setSidebarOpen] = useState(false)
    const [showLanguageMenu, setShowLanguageMenu] = useState(false)
    const [showResetModal, setShowResetModal] = useState(false)
    const [showLogoutModal, setShowLogoutModal] = useState(false)
    const location = useLocation()

    useEffect(() => {
        if(isSidebarOpen || showResetModal || showLogoutModal) {
            document.body.style.overflow = 'hidden'
        }else{
            document.body.style.overflow = 'auto'
        }

    },[isSidebarOpen,showResetModal,showLogoutModal])



    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng)
        setShowLanguageMenu(false)
    }

    const navItems = [
        {
            name: t('navigation.home'),
            icon: HomeIcon,
            path: '/',
            activeColor: 'from-emerald-400 to-green-500',
            hoverColor: 'hover:text-emerald-500'
        },
        {
            name: t('navigation.qrScanner'),
            icon: DevicePhoneMobileIcon,
            path: '/scanner',
            activeColor: 'from-purple-400 to-violet-500',
            hoverColor: 'hover:text-purple-500'
        },
        {
            name: t('navigation.mediaUpload'),
            icon: CloudArrowUpIcon,
            path: '/upload',
            activeColor: 'from-blue-400 to-cyan-500',
            hoverColor: 'hover:text-blue-500'
        },
        {
            name: t('navigation.excelImport'),
            icon: PhoneXMarkIcon,
            path: '/excel',
            activeColor: 'from-orange-400 to-amber-500',
            hoverColor: 'hover:text-orange-500'
        },
        {
            name: t('navigation.phoneNumbers'),
            icon: ClockIcon,
            path: '/numbers',
            activeColor: 'from-indigo-400 to-blue-500',
            hoverColor: 'hover:text-indigo-500'
        }
    ]

    return (
        <>
            <button
                onClick={() => setSidebarOpen(true)}
                className={`lg:hidden fixed top-4 ${isRTL ? 'right-4' : 'left-4'} z-50 p-2 rounded-lg bg-gradient-to-r from-gray-800 to-gray-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 ${isSidebarOpen ? 'hidden' : ''}`}
            >
                <Bars3Icon className="h-6 w-6" />
            </button>

            <div className={`
                fixed top-0 ${isRTL ? 'right-0' : 'left-0'} h-full w-64 z-40
                transform transition-transform duration-300 ease-in-out
                ${isSidebarOpen
                    ? 'translate-x-0'
                    : isRTL
                        ? 'translate-x-full lg:translate-x-0'
                        : '-translate-x-full lg:translate-x-0'
                }
                ${darkMode ? 'bg-gray-900/95' : 'bg-white/95'} backdrop-blur-md
                shadow-2xl ${isRTL ? 'border-l' : 'border-r'} ${darkMode ? 'border-gray-800' : 'border-gray-200'}
                flex flex-col
            `}>
                <div className="p-6 flex justify-between items-center">
                    <h1 className={`text-xl font-bold bg-gradient-to-r ${darkMode
                        ? 'from-blue-400 to-purple-400'
                        : 'from-blue-600 to-purple-600'
                        } bg-clip-text text-transparent`}>
                        {t('navigation.title')}
                    </h1>
                    <div className="flex items-center gap-2">

                        <div className="relative">
                            <button
                                onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                                className={`p-2 rounded-full ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} transition-colors`}
                            >
                                <LanguageIcon className="h-5 w-5 text-gray-500" />
                            </button>

                            {showLanguageMenu && (
                                <div className={`absolute right-0 mt-2 w-40 rounded-md shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} ring-1 ring-black ring-opacity-5 z-50`}>
                                    <div className="py-1" role="menu" aria-orientation="vertical">
                                        <button
                                            onClick={() => changeLanguage('en')}
                                            className={`block w-full text-left px-4 py-2 text-sm ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'} ${i18n.language === 'en' ? (darkMode ? 'bg-gray-700' : 'bg-gray-100') : ''}`}
                                            role="menuitem"
                                        >
                                            English
                                        </button>
                                        <button
                                            onClick={() => changeLanguage('fr')}
                                            className={`block w-full text-left px-4 py-2 text-sm ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'} ${i18n.language === 'fr' ? (darkMode ? 'bg-gray-700' : 'bg-gray-100') : ''}`}
                                            role="menuitem"
                                        >
                                            Français
                                        </button>
                                        <button
                                            onClick={() => changeLanguage('ar')}
                                            className={`block w-full text-left px-4 py-2 text-sm ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'} ${i18n.language === 'ar' ? (darkMode ? 'bg-gray-700' : 'bg-gray-100') : ''}`}
                                            role="menuitem"
                                        >
                                            العربية
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="lg:hidden text-gray-500 hover:text-gray-700 transition-colors"
                        >
                            <XMarkIcon className="h-6 w-6" />
                        </button>
                    </div>
                </div>

                <nav className="mt-8 px-4 space-y-2 flex-1">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path
                        return (
                            <Link
                                key={item.name}
                                to={item.path}
                                onClick={() => setSidebarOpen(false)}
                                className={`
                                    flex items-center px-4 py-3 rounded-xl capitalize
                                    transition-all duration-300 group relative
                                    ${isActive
                                        ? `bg-gradient-to-r ${item.activeColor} text-white
                                           shadow-lg shadow-current/20`
                                        : `${darkMode
                                            ? 'text-gray-400 hover:bg-gray-800/50'
                                            : 'text-gray-600 hover:bg-gray-100/80'
                                        } ${item.hoverColor}`
                                    }
                                `}
                            >
                                <item.icon className={`h-5 w-5 mr-3 transition-all duration-300 
                                    ${isActive
                                        ? 'animate-pulse'
                                        : 'group-hover:translate-x-1'}`}
                                />
                                <span className="font-medium">{item.name}</span>
                                {isActive && (
                                    <>
                                        <div className="absolute inset-y-1 right-2 w-1 rounded-full bg-white/20" />
                                        <div className="absolute -inset-1 rounded-xl bg-current/10 -z-10" />
                                    </>
                                )}
                            </Link>
                        )
                    })}
                </nav>


                <div className="p-4 space-y-3 border-t border-gray-200 dark:border-gray-800">
                    <ThemeSwitch />
                    <button
                        onClick={() => setShowResetModal(true)}
                        className={`
                            w-full flex items-center px-4 py-3 rounded-xl
                            transition-all duration-300 group
                            bg-gradient-to-r from-yellow-400 to-orange-500 
                            text-white hover:shadow-lg hover:shadow-orange-500/20
                        `}
                    >
                        <TrashIcon className="h-5 w-5 mr-3 group-hover:rotate-12 transition-transform duration-300" />
                        <span className="font-medium">{t('navigation.resetDatabase')}</span>
                    </button>
                    {/* Logout Function */}
                    <button
                    onClick={() => setShowLogoutModal(true)}
                    className={`
                        w-full flex items-center px-4 py-3 rounded-xl
                        transition-all duration-300 group
                        bg-gradient-to-r from-red-400 to-pink-500 
                        text-white hover:shadow-lg capitalize hover:shadow-red-500/20
                    `}
                >
                    <PowerIcon className="h-5 w-5 mr-3 group-hover:rotate-12 transition-transform duration-300" />
                    <span className="font-medium">{t('navigation.migrate')}</span>
                </button>

                </div>
            </div>

            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}
            {/* Reset */}
            <ResetDatabaseModal
                isOpen={showResetModal}
                onClose={() => setShowResetModal(false)}
            />
            {/* LogoutModel */}
            <LogoutModal
                isOpen={showLogoutModal}
                onClose={() => setShowLogoutModal(false)}
            />
        </>
    )
}