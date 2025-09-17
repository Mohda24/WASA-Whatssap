import React, { useState, useEffect } from 'react'
import { X, Download, RefreshCw, AlertCircle } from 'lucide-react'

const AutoUpdateModal = () => {
    const [updateInfo, setUpdateInfo] = useState(null)
    const [showModal, setShowModal] = useState(false)
    const [downloadProgress, setDownloadProgress] = useState(0)
    const [isDownloading, setIsDownloading] = useState(false)
    const [isDownloaded, setIsDownloaded] = useState(false)
    const [error, setError] = useState(null)
    const [updateStatus, setUpdateStatus] = useState('')

    useEffect(() => {
        if (!window.api) return

        // Set up event listeners
        const handleUpdateAvailable = (info) => {
            console.log('Update available:', info)
            setUpdateInfo(info)
            setShowModal(true)
            setIsDownloading(false)
            setIsDownloaded(false)
            setError(null)
        }

        const handleUpdateNotAvailable = () => {
            console.log('No update available')
            setShowModal(false)
        }

        const handleUpdateDownloaded = (info) => {
            console.log('Update downloaded:', info)
            setIsDownloading(false)
            setIsDownloaded(true)
            setDownloadProgress(100)
        }

        const handleUpdateError = (error) => {
            console.error('Update error:', error)
            setError(error.message)
            setIsDownloading(false)
        }

        const handleDownloadProgress = (progress) => {
            setDownloadProgress(progress.percent)
        }

        const handleUpdateStatus = (status) => {
            setUpdateStatus(status.message)
        }

        // Register listeners
        window.api.receive('update-available', handleUpdateAvailable)
        window.api.receive('update-not-available', handleUpdateNotAvailable)
        window.api.receive('update-downloaded', handleUpdateDownloaded)
        window.api.receive('update-error', handleUpdateError)
        window.api.receive('update-download-progress', handleDownloadProgress)
        window.api.receive('update-status', handleUpdateStatus)

        // Cleanup function
        return () => {
            window.api.removeListener('update-available', handleUpdateAvailable)
            window.api.removeListener('update-not-available', handleUpdateNotAvailable)
            window.api.removeListener('update-downloaded', handleUpdateDownloaded)
            window.api.removeListener('update-error', handleUpdateError)
            window.api.removeListener('update-download-progress', handleDownloadProgress)
            window.api.removeListener('update-status', handleUpdateStatus)
        }
    }, [])

    const handleDownloadUpdate = async () => {
        setIsDownloading(true)
        setError(null)
        setDownloadProgress(0)

        try {
            const result = await window.api.downloadUpdate()
            if (!result.success) {
                setError(result.error || 'Failed to start download')
                setIsDownloading(false)
            }
        } catch (error) {
            setError('Failed to start download')
            setIsDownloading(false)
        }
    }

    const handleInstallUpdate = async () => {
        try {
            await window.api.quitAndInstall()
        } catch (error) {
            setError('Failed to install update')
        }
    }

    const handleClose = () => {
        if (!isDownloading) {
            setShowModal(false)
            setUpdateInfo(null)
            setError(null)
            setDownloadProgress(0)
            setIsDownloaded(false)
        }
    }

    const formatFileSize = (bytes) => {
        if (!bytes) return 'Unknown size'
        const mb = bytes / (1024 * 1024)
        return `${mb.toFixed(1)} MB`
    }

    if (!showModal || !updateInfo) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                        <Download className="w-6 h-6 mr-2 text-blue-500" />
                        Update Available
                    </h2>
                    {!isDownloading && (
                        <button
                            onClick={handleClose}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    )}
                </div>

                {/* Content */}
                <div className="space-y-4">
                    {/* Version Info */}
                    <div>
                        <p className="text-gray-700 dark:text-gray-300">
                            A new version <span className="font-semibold">{updateInfo.version}</span> is available.
                        </p>
                        {updateInfo.downloadSize > 0 && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                Size: {formatFileSize(updateInfo.downloadSize)}
                            </p>
                        )}
                    </div>

                    {/* Release Notes */}
                    {updateInfo.releaseNotes && (
                        <div>
                            <h4 className="font-medium text-gray-900 dark:text-white mb-2">What's New:</h4>
                            <div className="bg-gray-50 dark:bg-gray-700 rounded p-3 max-h-32 overflow-y-auto">
                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                    {typeof updateInfo.releaseNotes === 'string'
                                        ? updateInfo.releaseNotes
                                        : 'Check the release notes for details.'}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-3">
                            <div className="flex items-center">
                                <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                                <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                            </div>
                        </div>
                    )}

                    {/* Download Progress */}
                    {isDownloading && (
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                    Downloading update...
                                </span>
                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                    {downloadProgress}%
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                <div
                                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${downloadProgress}%` }}
                                />
                            </div>
                        </div>
                    )}

                    {/* Status Message */}
                    {updateStatus && (
                        <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                            {updateStatus}
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-3 mt-6">
                    {!isDownloaded && !isDownloading && (
                        <>
                            <button
                                onClick={handleClose}
                                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                            >
                                Later
                            </button>
                            <button
                                onClick={handleDownloadUpdate}
                                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded flex items-center"
                            >
                                <Download className="w-4 h-4 mr-2" />
                                Download Now
                            </button>
                        </>
                    )}

                    {isDownloading && (
                        <button
                            disabled
                            className="px-4 py-2 bg-gray-400 text-white rounded cursor-not-allowed flex items-center"
                        >
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                            Downloading...
                        </button>
                    )}

                    {isDownloaded && (
                        <>
                            <button
                                onClick={handleClose}
                                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                            >
                                Install Later
                            </button>
                            <button
                                onClick={handleInstallUpdate}
                                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded flex items-center"
                            >
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Restart & Install
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

export default AutoUpdateModal
