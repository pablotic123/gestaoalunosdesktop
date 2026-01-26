import React from 'react';
import { BrowserRouter, HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { Toaster } from '@/components/ui/sonner';
import LoginPage from '@/pages/LoginPage';
import Layout from '@/components/Layout';
import DashboardPage from '@/pages/DashboardPage';
import StudentsPage from '@/pages/StudentsPage';
import PhotoGridPage from '@/pages/PhotoGridPage';
import TurmasPage from '@/pages/TurmasPage';
import CoursesPage from '@/pages/CoursesPage';
import InstitutionPage from '@/pages/InstitutionPage';
import UsersPage from '@/pages/UsersPage';
import DesktopStatus from '@/components/DesktopStatus';
import '@/index.css';

// Detectar se está no Electron para usar HashRouter (necessário para file://)
const isElectron = () => {
  if (typeof window !== 'undefined' && window.electronAPI?.isElectron) {
    return true;
  }
  if (typeof navigator !== 'undefined' && navigator.userAgent.toLowerCase().includes('electron')) {
    return true;
  }
  return false;
};

// Usar HashRouter no Electron (para funcionar com file://)
const Router = isElectron() ? HashRouter : BrowserRouter;

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }

  return !isAuthenticated ? children : <Navigate to="/dashboard" />;
};

function AppContent() {
  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="students" element={<StudentsPage />} />
          <Route path="photo-grid" element={<PhotoGridPage />} />
          <Route path="turmas" element={<TurmasPage />} />
          <Route path="courses" element={<CoursesPage />} />
          <Route path="institution" element={<InstitutionPage />} />
          <Route path="users" element={<UsersPage />} />
        </Route>
      </Routes>
      <Toaster position="top-right" />
      <DesktopStatus />
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
