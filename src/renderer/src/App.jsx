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
import ProtectedLayout from './components/ProtectedRoute'
import Premium from './components/Premium'

function App() {
    return (
        <Router>
            <AppProvider>
                <AppContentInside />
            </AppProvider>
        </Router>
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
        <Routes>
            
        <Route path="/premium" element={<Premium />} />
        <Route path="*" element={
            <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
                <Navigation />
                <div className={`${isRTL ? 'lg:mr-64' : 'lg:ml-64'} p-8`}>
                    <Routes>
                        <Route element={<ProtectedLayout />}>
                            <Route path="/" element={<Home />} />
                            <Route path="/scanner" element={<QRCodeScanner />} />
                            <Route path="/upload" element={<UploadData />} />
                            <Route path="/excel" element={<DataImport />} />
                            <Route path="/numbers" element={<PhoneNumbers />} />
                        </Route>
                    </Routes>
                </div>
            </div>
        } />
    </Routes>
    )
}

export default App