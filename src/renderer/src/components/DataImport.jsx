import React, { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import {
    TableCellsIcon,
    CloudArrowUpIcon,
    XMarkIcon,
    PlusIcon
} from '@heroicons/react/24/outline'
import * as XLSX from 'xlsx'
import { useApp } from '../context/AppContext'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'

export default function DataImport() {
    const { darkMode, excelData,
        setExcelData,
        manualNumber,
        setManualNumber,
        selectedColumn,
        setSelectedColumn,
        notify
    } = useApp()
    const { t } = useTranslation()
    // State for excel impor


    const onDropExcel = useCallback(async (acceptedFiles) => {
        const file = acceptedFiles[0]
        if (file) {
            const buffer = await file.arrayBuffer()
            const workbook = XLSX.read(buffer, { type: 'buffer' })
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
            const data = XLSX.utils.sheet_to_json(firstSheet)
            setExcelData(data)
            // Set first column as default selected column
            if (data.length > 0) {
                setSelectedColumn(Object.keys(data[0])[0])
            }
        }
    }, [])

    const { getRootProps, getInputProps } = useDropzone({
        onDrop: onDropExcel,
        accept: {
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
            'application/vnd.ms-excel': ['.xls']
        },
        maxFiles: 1
    })

    const handleRemoveRow = (index) => {
        setExcelData(prev => prev.filter((_, i) => i !== index))
    }

    const handleAddNumber = () => {
        if (manualNumber) {
            // Validate phone number
            const correctNumber = getCorrectNumber(manualNumber)

            const newRow = { [selectedColumn]: correctNumber }

            setExcelData(prev => [...prev, newRow])
            setManualNumber('')
        }
    }

    // get correct number
    const getCorrectNumber = (number) => {
        // Return empty string if number is null/undefined
        if (!number) return '';

        // Convert to string if number is not already a string
        if (typeof number !== 'string') number = String(number);

        // Remove '+' prefix if present, otherwise return number as-is
        return number.startsWith('+') ? number.slice(1) : number;
    }

    const handleImport = async () => {
        if (excelData.length > 0) {
            try {
                // Extract phone numbers from selected column
                const numbers = excelData.map(row => row[selectedColumn])
                // Validate phone numbers
                const validNumbers = numbers.map(number => getCorrectNumber(number))
                const result = await window.api.savePhoneNumbers(
                    validNumbers
                )

                if (result.success) {
                    setExcelData([])
                    setManualNumber('')
                    notify('notifications.success.numbersSaved')
                }
            } catch (err) {
                console.error('Import error:', err)
            }
        }
    }

    return (
        <div className="grid grid-cols-2 gap-6 p-6">
            <div className="space-y-6">
                {/* Excel Import */}
                <section className={`p-6 rounded-lg shadow-sm ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                    <div className="flex items-center gap-2 mb-4">
                        <TableCellsIcon className={`h-6 w-6 ${darkMode ? 'text-orange-400' : 'text-orange-500'}`} />
                        <h2 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {t('dataImport.importPhoneNumbers')}
                        </h2>
                    </div>
                    <div
                        {...getRootProps()}
                        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${darkMode
                                ? 'border-gray-600 hover:border-orange-400 hover:bg-gray-700/50'
                                : 'border-gray-300 hover:border-orange-500 hover:bg-orange-50'
                            }`}
                    >
                        <input {...getInputProps()} />
                        <CloudArrowUpIcon className={`h-12 w-12 mx-auto ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                        <p className={`mt-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {t('dataImport.dropExcelFile')}
                        </p>
                    </div>
                </section>

                {/* Manual Number Input */}
                <section className={`p-6 rounded-lg shadow-sm ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                    <h2 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {t('dataImport.addNumberManually')}
                    </h2>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            required
                            value={manualNumber}
                            onChange={(e) => {
                                const value = e.target.value;
                                // Allow only numbers and optional '+' at the start
                                if (/^\+?\d*$/.test(value)) {
                                    setManualNumber(value);
                                }
                            }}
                            placeholder={t('dataImport.enterPhoneNumber')}
                            className={`flex-1 px-4 py-2 rounded-md border ${darkMode
                                    ? 'bg-gray-700 border-gray-600 text-white'
                                    : 'bg-white border-gray-300'
                                }`}
                        />
                        <button
                            onClick={handleAddNumber}
                            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                        >
                            <PlusIcon className="h-5 w-5" />
                        </button>
                    </div>
                </section>
            </div>

            {/* Right Side - Preview */}
            <div className="space-y-6">
                <section className={`p-6 rounded-lg shadow-sm ${darkMode ? 'bg-gray-800' : 'bg-white'} min-h-[calc(100vh-3rem)]`}>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {t('dataImport.numbersPreview')}
                        </h2>
                        {excelData.length > 0 && (
                            <select
                                value={selectedColumn}
                                onChange={(e) => setSelectedColumn(e.target.value)}
                                className={`px-3 py-1 rounded-md ${darkMode
                                        ? 'bg-gray-700 text-white border-gray-600'
                                        : 'bg-white text-gray-900 border-gray-300'
                                    }`}
                            >
                                {Object.keys(excelData[0] || {}).map(key => (
                                    <option key={key} value={key}>{key}</option>
                                ))}
                            </select>
                        )}
                    </div>

                    {excelData.length > 0 && (
                        <div className="space-y-4">
                            <div className={`overflow-auto max-h-[60vh] ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                                <table className="w-full">
                                    <thead>
                                        <tr>
                                            <th className="p-2 text-left border-b">{t('dataImport.number')}</th>
                                            <th className="p-2 text-left border-b">{t('dataImport.action')}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {excelData.map((row, i) => (
                                            <tr key={i}>
                                                <td className="p-2 border-b">{row[selectedColumn]}</td>
                                                <td className="p-2 border-b">
                                                    <button
                                                        onClick={() => handleRemoveRow(i)}
                                                        className="text-red-500 hover:text-red-600"
                                                    >
                                                        <XMarkIcon className="h-5 w-5" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <button
                                onClick={handleImport}
                                className={`w-full py-3 rounded-md text-white ${darkMode
                                        ? 'bg-blue-600 hover:bg-blue-700'
                                        : 'bg-blue-600 hover:bg-blue-700'
                                    }`}
                            >
                                {t('dataImport.saveToDatabase')}
                            </button>
                        </div>
                    )}
                </section>
            </div>
        </div>
    )
}