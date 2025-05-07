// src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

export default function ProtectedRoute() {
    const { isLoggedIn} = useApp();
    return isLoggedIn
        ? <Outlet />
        : <Navigate to="/auth" replace />;
}
