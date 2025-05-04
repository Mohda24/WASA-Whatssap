import React, { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { ChatBubbleLeftRightIcon, ArrowTrendingUpIcon, ChartBarIcon } from '@heroicons/react/24/outline'
import { useTranslation } from 'react-i18next';

function Statistique() {
    const { darkMode } = useApp()
    const [stats, setStats] = useState({
        dailyMessages: 0,
        conversionRate: 0,
        trafficVolume: 0
    })
    const { t } = useTranslation()

    useEffect(() => {
        // Function to fetch stats
        const fetchStats = async () => {
            try {
                const dailyStats = await window.api.getDailyStats(1) // Get today's stats
                const todayStats = dailyStats[0] || { total_messages: 0, conversion_count: 0, conversion_rate: 0 }
                
                setStats({
                    dailyMessages: todayStats.total_messages,
                    conversionRate: todayStats.conversion_rate,
                    trafficVolume: todayStats.conversion_count
                })
            } catch (error) {
                console.error('Error fetching stats:', error)
            }
        }

        fetchStats()

    }, [stats])

    const cards = [
        {
            title: t('home.stats.dailyMessages'),
            value: stats.dailyMessages,
            icon: ChatBubbleLeftRightIcon,
            color: 'bg-blue-500',
            textColor: 'text-blue-600',
            bgLight: 'bg-blue-50',
            bgDark: 'bg-blue-900/20'
        },
        {
            title: t('home.stats.conversionRate'),
            value: `${stats.conversionRate}%`,
            icon: ArrowTrendingUpIcon,
            color: 'bg-green-500',
            textColor: 'text-green-600',
            bgLight: 'bg-green-50',
            bgDark: 'bg-green-900/20'
        },
        {
            title: t('home.stats.trafficVolume'),
            value: stats.trafficVolume,
            icon: ChartBarIcon,
            color: 'bg-purple-500',
            textColor: 'text-purple-600',
            bgLight: 'bg-purple-50',
            bgDark: 'bg-purple-900/20'
        }
    ]

    return (
        <div className="p-6">

            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cards.map((card, index) => (
                    <div
                        key={index}
                        className={`rounded-xl p-6 ${
                            darkMode ? 'bg-gray-800' : 'bg-white'
                        } shadow-lg transform transition-all duration-300 hover:scale-105`}
                    >
                        <div className="flex items-center justify-between">
                            <div className={`p-3 rounded-full ${darkMode ? card.bgDark : card.bgLight}`}>
                                <card.icon
                                    className={`w-8 h-8 ${card.textColor}`}
                                    aria-hidden="true"
                                />
                            </div>
                            <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                {card.value}
                            </div>
                        </div>
                        <div className="mt-4">
                            <h3 className={`text-lg font-medium ${darkMode ? 'text-gray-200' : 'text-gray-600'}`}>
                                {card.title}
                            </h3>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default Statistique