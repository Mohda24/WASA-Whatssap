import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import { useApp } from '../context/AppContext';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';

Chart.register(...registerables);

export default function MessageChart() {
    const { darkMode,chartData,setChartData } = useApp();
    const { t } = useTranslation();
    const [isLoading, setIsLoading] = useState(true);
    const [timeRange, setTimeRange] = useState(12);
    // const [chartData, setChartData] = useState(null);

    // Theme colors
    const theme = {
        textColor: darkMode ? 'rgba(255, 255, 255, 0.87)' : 'rgba(17, 24, 39, 0.87)',
        gridColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        borderColor: darkMode ? 'rgba(75, 85, 99, 0.3)' : 'rgba(209, 213, 219, 0.5)',
        backgroundColor: darkMode ? 'rgba(99, 102, 241, 0.7)' : 'rgba(79, 70, 229, 0.7)',
        gradientFrom: darkMode ? 'rgba(99, 102, 241, 0.7)' : 'rgba(79, 70, 229, 0.7)',
        gradientTo: darkMode ? 'rgba(99, 102, 241, 0.1)' : 'rgba(79, 70, 229, 0.1)',
        tooltipBg: darkMode ? 'rgba(31, 41, 55, 0.9)' : 'rgba(255, 255, 255, 0.98)',
        tooltipText: darkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(17, 24, 39, 0.9)',
    };

    // Load initial data
    const loadData = async (hours = timeRange) => {
        setIsLoading(true);
        try {
            const stats = await window.api.getHourlyStats(hours);
            updateChartData(stats);
        } catch (error) {
            console.error('Failed to load chart data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [timeRange]);

    // Refresh when dark mode changes
    useEffect(() => {
        if (chartData) {
            updateChartDataForTheme(chartData.labels, chartData.datasets[0].data);
        }
    }, [darkMode]);

    // Listen for live updates
    useEffect(() => {
        let updateTimeout;
        const handleNewMessage = (hour) => {
            clearTimeout(updateTimeout);
            updateTimeout = setTimeout(() => {
                setChartData(prev => {
                    if (!prev) return prev;
                    
                    // Create a deep copy of the previous data
                    const newData = {
                        labels: [...prev.labels],
                        datasets: [{
                            ...prev.datasets[0],
                            data: [...prev.datasets[0].data]
                        }]
                    };
                    
                    const hourIndex = newData.labels.indexOf(hour);

                    if (hourIndex >= 0) {
                        // Instead of incrementing, fetch the actual count
                        const stats = window.api.getHourlyStats(timeRange)
                            .then(stats => {
                                const currentHourStat = stats.find(stat => stat.hour === hour);
                                if (currentHourStat) {
                                    newData.datasets[0].data[hourIndex] = currentHourStat.count;
                                    setChartData(newData);
                                }
                            })
                            .catch(error => {
                                console.error('Failed to update chart data:', error);
                            });
                    } else {
                        newData.labels.push(hour);
                        newData.datasets[0].data.push(1);
                        
                        // Keep only last X hours
                        if (newData.labels.length > timeRange) {
                            newData.labels.shift();
                            newData.datasets[0].data.shift();
                        }
                        
                        return newData;
                    }
                    
                    return prev;
                });
            }, 300); // 300ms debounce
        };

        window.api.receive('new-message', handleNewMessage);
        return () => {
            window.api.removeListener('new-message', handleNewMessage);
            clearTimeout(updateTimeout);
        };
    }, [timeRange]);

    const updateChartData = (stats) => {
        const labels = stats.map(item => item.hour);
        const data = stats.map(item => item.count);
        updateChartDataForTheme(labels, data);
    };

    const updateChartDataForTheme = (labels, data) => {
        setChartData({
            labels,
            datasets: [
                {
                    label: 'Messages per Hour',
                    data,
                    backgroundColor: function(context) {
                        const chart = context.chart;
                        const {ctx, chartArea} = chart;
                        if (!chartArea) return theme.backgroundColor;
                        
                        // Create gradient
                        const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
                        gradient.addColorStop(0, theme.gradientTo);
                        gradient.addColorStop(1, theme.gradientFrom);
                        return gradient;
                    },
                    borderColor: theme.backgroundColor,
                    borderWidth: 1,
                    borderRadius: 6,
                    hoverBackgroundColor: theme.backgroundColor,
                }
            ]
        });
    };

    const timeRangeOptions = [
        { value: 6, label: t('chart.timeRange.6hours') },
        { value: 12, label: t('chart.timeRange.12hours') },
        { value: 24, label: t('chart.timeRange.24hours') }
    ];

    return (
        <div className={`w-full rounded-xl p-4 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm transition-all duration-300`}>
            <div className="flex justify-between items-center mb-4">
                <h2 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    {t('chart.title')}
                </h2>
                
                <div className="flex items-center gap-3">
                    <div className={`flex rounded-lg overflow-hidden border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                        {timeRangeOptions.map(option => (
                            <button
                                key={option.value}
                                onClick={() => setTimeRange(option.value)}
                                className={`px-3 py-1.5 text-sm ${
                                    timeRange === option.value 
                                        ? (darkMode ? 'bg-indigo-600 text-white' : 'bg-indigo-100 text-indigo-700')
                                        : (darkMode ? 'bg-gray-800 text-gray-400 hover:bg-gray-700' : 'bg-white text-gray-700 hover:bg-gray-50')
                                } transition-colors duration-200`}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                    
                    <button 
                        onClick={() => loadData()}
                        className={`p-2 rounded-full ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'} transition-colors duration-200`}
                        title="Refresh data"
                    >
                        <ArrowPathIcon className="h-4 w-4" />
                    </button>
                </div>
            </div>

            <div className="h-80 relative">
                {isLoading ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className={`animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 ${darkMode ? 'border-indigo-500' : 'border-indigo-600'}`}></div>
                    </div>
                ) : chartData && chartData.labels.length === 0 ? (
                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                        <p className={`text-lg font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {t('chart.noData')}
                        </p>
                        <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                            {t('chart.noDataDescription')}
                        </p>
                    </div>
                ) : chartData ? (
                    <Bar
                        data={{
                            ...chartData,
                            datasets: [{
                                ...chartData.datasets[0],
                                label: t('chart.messagesPerHour')
                            }]
                        }}
                        options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            animation: {
                                duration: 400, 
                                easing: 'easeOutQuart'
                            },
                            plugins: {
                                legend: {
                                    display: false
                                },
                                tooltip: {
                                    backgroundColor: theme.tooltipBg,
                                    titleColor: theme.tooltipText,
                                    bodyColor: theme.tooltipText,
                                    padding: 12,
                                    cornerRadius: 8,
                                    boxPadding: 6,
                                    usePointStyle: true,
                                    callbacks: {
                                        label: (context) => `${context.parsed.y} ${t('chart.messages')}`
                                    }
                                }
                            },
                            scales: {
                                y: {
                                    beginAtZero: true,
                                    grid: {
                                        color: theme.gridColor,
                                        drawBorder: false
                                    },
                                    border: {
                                        display: false
                                    },
                                    ticks: {
                                        color: theme.textColor,
                                        font: {
                                            size: 11
                                        },
                                        padding: 8
                                    }
                                },
                                x: {
                                    grid: {
                                        display: false
                                    },
                                    border: {
                                        display: false
                                    },
                                    ticks: {
                                        color: theme.textColor,
                                        font: {
                                            size: 11
                                        },
                                        padding: 5
                                    }
                                }
                            }
                        }}
                    />
                ) : null}
            </div>
        </div>
    );
}