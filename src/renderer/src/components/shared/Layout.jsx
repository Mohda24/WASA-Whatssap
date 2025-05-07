// src/components/Layout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import Navigation from '../Navigation';
import { useApp } from '../../context/AppContext';

export default function Layout() {
    const { darkMode, isRTL } = useApp();

    return (
        <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
            <Navigation />
            <div className={`${isRTL ? 'lg:mr-64' : 'lg:ml-64'} p-8`}>
                <Outlet />
            </div>
        </div>
    );
}
