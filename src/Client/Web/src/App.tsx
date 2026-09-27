import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* التوجيه الافتراضي عند فتح الموقع */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* صفحة تسجيل الدخول */}
        <Route path="/login" element={<LoginPage />} />
        
        {/* صفحة إنشاء الحساب */}
        <Route path="/register" element={<RegisterPage />} />
      </Routes>
    </BrowserRouter>
  );
}