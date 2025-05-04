import React, { useEffect } from 'react'
import { HashRouter as Router, Routes, Route } from 'react-router-dom'
import Navigation from './components/Navigation'
import QRCodeScanner from './components/QRCodeScanner'
import UploadData from './components/UploadData'
import DataImport from './components/DataImport'
import Home from './components/Home'
import PhoneNumbers from './components/PhoneNumbers'
import { AppProvider, useApp } from './context/AppContext'
import './i18n';

function App() {
    return (
        <AppProvider>
            <AppContentInside />
        </AppProvider>
    )
}

function AppContentInside() {
    const { 
        darkMode,
        isRTL 
    } = useApp()

    useEffect(() => {
        document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    }, [isRTL]);

    return (
        <Router>
            <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
                <Navigation />
                <div className={`${isRTL ? 'lg:mr-64' : 'lg:ml-64'} p-8`}>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/scanner" element={<QRCodeScanner />} />
                        <Route path="/upload" element={<UploadData />} />
                        <Route path="/excel" element={<DataImport />} />
                        <Route path="/numbers" element={<PhoneNumbers />} />
                    </Routes>
                </div>
            </div>
        </Router>
    )
}

export default App