import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const ProtectedLayout = () => {
    const {messageCount}=useApp()

    if (messageCount >= 5) {
        return <Navigate to="/premium" replace />;
    }
    
    // Otherwise, render the child routes
    return <Outlet />;
};

export default ProtectedLayout;