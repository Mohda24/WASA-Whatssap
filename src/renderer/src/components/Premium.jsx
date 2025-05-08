import React, { useState } from 'react';
import { CheckCircleIcon, ChatBubbleLeftEllipsisIcon, ShieldCheckIcon, ClockIcon, ChevronRightIcon, GlobeAltIcon } from '@heroicons/react/24/outline';

export default function Premium() {
    const [darkMode, setDarkMode] = useState(false);
    const [language, setLanguage] = useState('en');

    const translations = {
        en: {
            title: "Your free trial has ended successfully!",
            subtitle: "To unlock the full unlimited version of WASA, contact us on WhatsApp — we'll be happy to assist you",
            contactButton: "Contact us on WhatsApp",
            darkMode: "Dark Mode",
            lightMode: "Light Mode",
            benefits: {
                title: "Premium Benefits",
                items: [
                    "Unlimited messages",
                    "Priority support",
                    "Advanced features",
                    "Custom integrations"
                ]
            }
        },
        ar: {
            title: "تمت تجربة النسخة المجانية بنجاح!",
            subtitle: "للحصول على النسخة اللامحدودة من WASA، تواصل معنا عبر واتساب وسنكون سعداء بخدمتك",
            contactButton: "تواصل معنا عبر واتساب",
            darkMode: "الوضع الداكن",
            lightMode: "الوضع الفاتح",
            benefits: {
                title: "مزايا النسخة المميزة",
                items: [
                    "رسائل غير محدودة",
                    "دعم ذو أولوية",
                    "ميزات متقدمة",
                    "تكاملات مخصصة"
                ]
            }
        },
        fr: {
            title: "La version d'essai gratuite s'est terminée avec succès !",
            subtitle: "Pour obtenir la version complète et illimitée de WASA, contactez-nous via WhatsApp — nous serons ravis de vous aider",
            contactButton: "Contactez-nous sur WhatsApp",
            darkMode: "Mode Sombre",
            lightMode: "Mode Clair",
            benefits: {
                title: "Avantages Premium",
                items: [
                    "Messages illimités",
                    "Support prioritaire",
                    "Fonctionnalités avancées",
                    "Intégrations personnalisées"
                ]
            }
        }
    };

    const t = translations[language];
    const whatsappLink = "https://wa.me/212663092668";
    const isRTL = language === 'ar';

    const toggleDarkMode = () => {
        setDarkMode(!darkMode);
    };

    return (
        <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-100'} flex items-center justify-center p-4`} dir={isRTL ? 'rtl' : 'ltr'}>
            <div className={`max-w-md w-full rounded-xl overflow-hidden shadow-xl ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                {/* Header with gradient */}
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
                    <div className="flex justify-between items-center mb-4">
                        <h1 className="text-2xl font-bold">WASA</h1>
                        <div className="flex gap-2">
                            <button 
                                onClick={() => setLanguage('en')} 
                                className={`px-2 py-1 rounded ${language === 'en' ? 'bg-white/20' : ''}`}
                            >
                                EN
                            </button>
                            <button 
                                onClick={() => setLanguage('ar')} 
                                className={`px-2 py-1 rounded ${language === 'ar' ? 'bg-white/20' : ''}`}
                            >
                                AR
                            </button>
                            <button 
                                onClick={() => setLanguage('fr')} 
                                className={`px-2 py-1 rounded ${language === 'fr' ? 'bg-white/20' : ''}`}
                            >
                                FR
                            </button>
                        </div>
                    </div>
                    <h2 className="text-xl font-semibold mb-2">{t.title}</h2>
                    <p className="opacity-90">{t.subtitle}</p>
                </div>

                {/* Dark mode toggle */}
                <div className="px-6 pt-4">
                    <button 
                        onClick={toggleDarkMode} 
                        className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'} flex items-center`}
                    >
                        {darkMode ? t.lightMode : t.darkMode}
                    </button>
                </div>

                {/* Premium Benefits */}
                <div className={`p-6 ${darkMode ? 'text-white' : 'text-gray-700'}`}>
                    <h3 className="text-lg font-semibold mb-4">{t.benefits.title}</h3>
                    <div className="space-y-3">
                        {t.benefits.items.map((item, index) => (
                            <div key={index} className="flex items-center gap-3">
                                <div className="bg-green-500 rounded-full p-1 flex items-center justify-center">
                                    <CheckCircleIcon className="h-4 w-4 text-white" />
                                </div>
                                <span>{item}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Feature Cards */}
                <div className={`px-6 pb-6 grid grid-cols-2 gap-3 ${darkMode ? 'text-white' : 'text-gray-700'}`}>
                    <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} flex flex-col items-center text-center`}>
                        <ChatBubbleLeftEllipsisIcon className={`h-6 w-6 mb-2 ${darkMode ? 'text-blue-400' : 'text-blue-500'}`} />
                        <span className="text-sm">Unlimited Messages</span>
                    </div>
                    <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} flex flex-col items-center text-center`}>
                        <ShieldCheckIcon className={`h-6 w-6 mb-2 ${darkMode ? 'text-blue-400' : 'text-blue-500'}`} />
                        <span className="text-sm">Premium Support</span>
                    </div>
                </div>

                {/* CTA Button */}
                <div className="p-6 pt-0">
                    <a 
                        href={whatsappLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full p-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors"
                    >
                        {t.contactButton}
                        <ChevronRightIcon className="h-5 w-5" />
                    </a>
                </div>
            </div>
        </div>
    );
}