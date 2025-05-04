import React from 'react';
import { useApp } from '../context/AppContext';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';

function ThemeSwitch() {
    const { darkMode, toggleDarkMode } = useApp();
    
    return (
        <div className="relative">
            {/* Glow effect */}
            <div 
                className={`absolute inset-0 rounded-full blur-lg transition-all duration-700 opacity-70
                    ${darkMode 
                        ? 'bg-indigo-500/30 scale-110' 
                        : 'bg-amber-400/30 scale-110'
                    }
                `}
            />
            
            <button
                onClick={() => toggleDarkMode(!darkMode)}
                className={`
                    relative flex items-center justify-between p-1.5 rounded-full
                    transition-all duration-500 ease-out
                    ${darkMode 
                        ? 'bg-gradient-to-r from-slate-800 via-indigo-950 to-slate-800 border-2 border-indigo-500/20' 
                        : 'bg-gradient-to-r from-amber-50 via-white to-amber-50 border-2 border-amber-300/20'
                    }
                    shadow-xl
                    ${darkMode 
                        ? 'shadow-indigo-900/40' 
                        : 'shadow-amber-300/30'
                    }
                    hover:scale-105 active:scale-95 
                    hover:shadow-2xl
                    ${darkMode 
                        ? 'hover:shadow-indigo-700/30' 
                        : 'hover:shadow-amber-300/40'
                    }
                    backdrop-blur-sm
                    group w-20 h-10
                    overflow-hidden
                `}
                aria-label="Toggle theme"
            >
                {/* Moving background pattern */}
                <div className={`absolute inset-0 opacity-10 transition-opacity duration-500 ${darkMode ? 'opacity-20' : 'opacity-10'}`}>
                    <div className="absolute inset-0 bg-repeat bg-[length:10px_10px] rotate-45 scale-150 animate-slow-pulse">
                        {darkMode ? (
                            <svg width="20" height="20" viewBox="0 0 20 20" className="text-indigo-500">
                                <path fillRule="evenodd" d="M10 15a5 5 0 100-10 5 5 0 000 10z" />
                            </svg>
                        ) : (
                            <svg width="20" height="20" viewBox="0 0 20 20" className="text-amber-400">
                                <path fillRule="evenodd" d="M10 15a5 5 0 100-10 5 5 0 000 10z" />
                            </svg>
                        )}
                    </div>
                </div>

                {/* Toggle Pill */}
                <div 
                    className={`
                        absolute h-7 w-7 rounded-full z-10
                        transform transition-all duration-500
                        ${darkMode 
                            ? 'translate-x-9 bg-gradient-to-br from-indigo-600 to-indigo-900' 
                            : 'translate-x-0 bg-gradient-to-br from-amber-400 to-amber-500'
                        }
                        shadow-lg
                        ${darkMode 
                            ? 'shadow-indigo-800/50' 
                            : 'shadow-amber-500/50'
                        }
                        flex items-center justify-center
                        ring-2
                        ${darkMode 
                            ? 'ring-indigo-400/30' 
                            : 'ring-amber-300/30'
                        }
                    `}
                    style={{ transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)' }}
                >
                    {/* Icon with subtle animation */}
                    {darkMode ? (
                        <MoonIcon className="h-4 w-4 text-white animate-float" />
                    ) : (
                        <SunIcon className="h-4 w-4 text-white animate-spin-slow" />
                    )}
                </div>

                {/* Background Icons */}
                <div className="relative z-0 flex items-center justify-between w-full px-1.5">
                    <div className="flex items-center justify-center w-6 h-6 overflow-hidden">
                        <SunIcon className={`h-4 w-4 transition-all duration-500 
                            ${darkMode 
                                ? 'text-slate-600/40 opacity-40 scale-75 rotate-45' 
                                : 'text-white opacity-100 scale-110 rotate-0'
                            }`} 
                        />
                    </div>
                    <div className="flex items-center justify-center w-6 h-6 overflow-hidden">
                        <MoonIcon className={`h-4 w-4 transition-all duration-500 
                            ${darkMode 
                                ? 'text-white opacity-100 scale-110 rotate-0' 
                                : 'text-slate-400/40 opacity-40 scale-75 rotate-45'
                            }`} 
                        />
                    </div>
                </div>
            </button>
        </div>
    );
}
export default ThemeSwitch;