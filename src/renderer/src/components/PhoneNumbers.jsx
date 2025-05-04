import React, { useEffect, useState } from 'react'
import { useApp } from '../context/AppContext'
import { useTranslation } from 'react-i18next'
import DatePicker from 'react-datepicker'
import "react-datepicker/dist/react-datepicker.css"
import { CalendarIcon, ArrowDownTrayIcon, TrashIcon } from '@heroicons/react/24/outline'
import * as XLSX from 'xlsx'
import Modal from './shared/Modal'

export default function PhoneNumbers() {
    const { t } = useTranslation()
    const {
        darkMode,
        numbers,
        currentPage,
        setCurrentPage,
        totalPages,
        loading,
        fetchNumbers,
        isRTL
        
    } = useApp()

    const [selectedNumbers, setSelectedNumbers] = useState([])
    const [filters, setFilters] = useState({
        startDate: null,
        endDate: null,
        month: ''
    })

    useEffect(() => {
        const formattedFilters = {
            startDate: filters.startDate ? filters.startDate.toLocaleDateString('en-CA') : '',
            endDate: filters.endDate ? filters.endDate.toLocaleDateString('en-CA') : '',
            month: filters.month
        }

        console.log("Sending filters:", formattedFilters)
        fetchNumbers(currentPage, formattedFilters)
    }, [currentPage, filters])

    useEffect(() => {
        const handleScroll = () => {
            const header = document.getElementById('sticky-header')
            if (header) {
                header.classList.toggle('shadow-md', window.scrollY > 10)
            }
        }

        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const exportToExcel = () => {
        const dataToExport = numbers.map(number => ({
            ID: number.id,
            'Phone Number': number.phone,
            'Added Date': new Date(number.created_at).toLocaleDateString()
        }))
        const wb = XLSX.utils.book_new()
        const ws = XLSX.utils.json_to_sheet(dataToExport)
        XLSX.utils.book_append_sheet(wb, ws, 'Numbers')
        XLSX.writeFile(wb, `phone_numbers_${new Date().toISOString().split('T')[0]}.xlsx`)
    }

    const handleSelectAll = () => {
        if (selectedNumbers.length === numbers.length) {
            setSelectedNumbers([])
        } else {
            setSelectedNumbers(numbers.map(n => n.id))
        }
    }

    const handleSelectNumber = (id) => {
        setSelectedNumbers(prev => {
            if (prev.includes(id)) {
                return prev.filter(numberId => numberId !== id)
            } else {
                return [...prev, id]
            }
        })
    }

    // Add state for delete confirmation modal
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

    // Modify the handleDeleteSelected function
    const handleDeleteSelected = async () => {
        setIsDeleteModalOpen(true)
    }

    // Add the actual delete function
    const confirmDelete = async () => {
        try {
            for (const id of selectedNumbers) {
                await window.api.resetPhoneNumberById(id)
            }
            setSelectedNumbers([])
            fetchNumbers(currentPage, filters)
            setIsDeleteModalOpen(false)
        } catch (error) {
            console.error('Error deleting numbers:', error)
        }
    }

    return (
        <div className="space-y-6">
            <div
                id="sticky-header"
                className={`sticky top-0 z-10 transition-shadow py-4 bg-opacity-90 backdrop-blur-md ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} flex justify-between items-center`}
            >
                <h1 className={`text-lg xl:text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {t('phoneNumbers.title')}
                </h1>

                <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                        <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>  {t('phoneNumbers.filters.from')}: </span>
                        <DatePicker
                            selected={filters.startDate}
                            onChange={(date) => setFilters(prev => ({
                                ...prev,
                                startDate: date,
                                month: '',
                                endDate: date > prev.endDate ? null : prev.endDate
                            }))}
                            selectsStart
                            startDate={filters.startDate}
                            maxDate={new Date()}
                            endDate={filters.endDate}
                            placeholderText={t('phoneNumbers.filters.startDate')}
                            className={`px-3 py-2 rounded-md ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-200 border-gray-300 border'}`}
                            dateFormat="yyyy-MM-dd"
                        />
                        <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{t("phoneNumbers.filters.to")}: </span>
                        <DatePicker
                            selected={filters.endDate}
                            onChange={(date) => setFilters(prev => ({
                                ...prev,
                                endDate: date,
                                month: ''
                            }))}
                            selectsEnd
                            startDate={filters.startDate}
                            endDate={filters.endDate}
                            minDate={filters.startDate}
                            placeholderText={t('phoneNumbers.filters.endDate')}
                            className={`px-3 py-2 rounded-md ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-200 border-gray-300 border'}`}
                            dateFormat="yyyy-MM-dd"
                        />
                    </div>

                    <div className="flex gap-2">
                        {selectedNumbers.length > 0 && (
                            <button
                                onClick={handleDeleteSelected}
                                className={`inline-flex items-center px-4 py-2 rounded-md ${darkMode ? 'bg-red-600 hover:bg-red-700' : 'bg-red-500 hover:bg-red-600'} text-white animate-fadeUp`}
                            >
                                <TrashIcon className="w-5 h-5 mr-2" />
                                {t('phoneNumbers.deleteSelected')} ({selectedNumbers.length})
                            </button>
                        )}
                        <button
                            onClick={exportToExcel}
                            className={`inline-flex items-center px-4 py-2 rounded-md ${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
                        >
                            <ArrowDownTrayIcon className="w-5 h-5 mr-2" />
                            {t('phoneNumbers.export')}
                        </button>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
            ) : (
                <>
                    <div className={`rounded-lg shadow ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                        <table className="min-w-full">
                            <thead>
                                <tr className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                                    <th className={`px-6 py-3 ${isRTL ? "" :"text-left"}  text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                        <input
                                            type="checkbox"
                                            checked={selectedNumbers.length === numbers.length && numbers.length > 0}
                                            onChange={handleSelectAll}
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                    </th>
                                    <th className={`px-6 py-3 ${isRTL ? "" :"text-left"}  text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                        {t('phoneNumbers.table.id')}
                                    </th>
                                    <th className={`px-6 py-3 ${isRTL ? "" :"text-left"}  text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                        {t('phoneNumbers.table.phone')}
                                    </th>
                                    <th className={`px-6 py-3 ${isRTL ? "" :"text-left"}  text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                        {t('phoneNumbers.table.addedDate')}
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {numbers.map((number) => (
                                    <tr
                                    key={number.id}
                                    onClick={() => handleSelectNumber(number.id)}
                                    className={`transition-colors duration-150 cursor-pointer
                                        ${selectedNumbers.includes(number.id)
                                            ? (darkMode ? 'bg-indigo-900/30' : 'bg-indigo-50')
                                            : ''
                                        }
                                        hover:${darkMode ? 'bg-gray-700/50' : 'bg-indigo-50/50'}`}
                                >
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selectedNumbers.includes(number.id)}
                                                onChange={() => handleSelectNumber(number.id)}
                                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                        </td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                                            {number.id}
                                        </td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                                            {number.phone}
                                        </td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                                            {new Date(number.created_at).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex justify-center space-x-2">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className={`px-4 py-2 rounded-md ${darkMode
                                ? 'bg-gray-700 text-white hover:bg-gray-600 disabled:bg-gray-800'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:bg-gray-100'
                                } disabled:cursor-not-allowed`}
                        >
                            {t('phoneNumbers.pagination.previous')}
                        </button>
                        <span className={`px-4 py-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {t('phoneNumbers.pagination.page', { current: currentPage, total: totalPages })}
                        </span>
                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className={`px-4 py-2 rounded-md ${darkMode
                                ? 'bg-gray-700 text-white hover:bg-gray-600 disabled:bg-gray-800'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:bg-gray-100'
                                } disabled:cursor-not-allowed`}
                        >
                            {t('phoneNumbers.pagination.next')}
                        </button>
                    </div>
                </>
            )}
            {/* Modal For Confirm Delete */}
            {
                isDeleteModalOpen && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 m-0!"/>
                )
            }
            {
                isDeleteModalOpen && (
                    <Modal
                        onClose={() => setIsDeleteModalOpen(false)}
                        onSubmit={confirmDelete}
                        title={t('phoneNumbers.deleteConfirmation.title')}
                        content={t('phoneNumbers.deleteConfirmation.message', { count: selectedNumbers.length })}
                    />
                )
            }

           
        </div>

    )
    {/* Add Delete Confirmation Modal */ }

}
