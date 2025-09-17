// src/App.jsx (or wherever you configure Router)
import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import Auth from './components/Auth';
import Layout from './components/shared/Layout';
import ProtectedRoute from './components/shared/ProtectedRoute';
import Home from './components/Home';
import QRCodeScanner from './components/QRCodeScanner';
import UploadData from './components/UploadData';
import DataImport from './components/DataImport';
import PhoneNumbers from './components/PhoneNumbers';
import { WhatsAppSender } from './components/WhatssapSender';
import './i18n';
import { WhatsAppSenderProvider } from './context/WhatssapSenderContext';
import AutoUpdateModal from './components/AutoUpdateModel';

function AppContentInside() {
    const { isRTL } = useApp();

    useEffect(() => {
        document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    }, [isRTL]);

    return (
        <>
            <Router>
                <Routes>
                    {/* Public Auth page, no Navigation */}
                    <Route path="/auth" element={<Auth />} />

                    {/* All other routes go through ProtectedRoute + Layout */}
                    <Route path="/*" element={
                        <ProtectedRoute>
                            <WhatsAppSenderProvider>
                                <Layout>
                                    <Routes>
                                        <Route path="/" element={<Home />} />
                                        <Route path="/qr-scanner" element={<QRCodeScanner />} />
                                        <Route path="/upload" element={<UploadData />} />
                                        <Route path="/import" element={<DataImport />} />
                                        <Route path="/phone-numbers" element={<PhoneNumbers />} />
                                        <Route path="/whatsapp-sender" element={<WhatsAppSender />} />
                                    </Routes>
                                </Layout>
                            </WhatsAppSenderProvider>
                        </ProtectedRoute>
                    } />
                </Routes>
            </Router>
            {/* ADD THE AUTO-UPDATE MODAL HERE */}
            <AutoUpdateModal />
        </>
    );
}

export default function App() {
    return (
        <AppProvider>
            <WhatsAppSenderProvider>
                <AppContentInside />
            </WhatsAppSenderProvider>
        </AppProvider>
    );
}
