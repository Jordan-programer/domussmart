import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Moradores from './pages/Moradores';
import Unidades from './pages/Unidades';
import Blocos from './pages/Blocos';
import Condominio from './pages/Condominio';
import Avisos from './pages/Avisos';
import Visitantes from './pages/Visitantes';
import Reservas from './pages/Reservas';
import Chamados from './pages/Chamados';
import Financeiro from './pages/Financeiro';
import GestorMaximo from './pages/GestorMaximo';
import Perfil from './pages/Perfil';
import Usuarios from './pages/Usuarios';
import Portaria from './pages/Portaria';

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/portaria" element={<ProtectedRoute><Portaria /></ProtectedRoute>} />
        <Route path="/moradores" element={<ProtectedRoute><Moradores /></ProtectedRoute>} />
        <Route path="/unidades" element={<ProtectedRoute><Unidades /></ProtectedRoute>} />
        <Route path="/blocos" element={<ProtectedRoute><Blocos /></ProtectedRoute>} />
        <Route path="/condominio" element={<ProtectedRoute><Condominio /></ProtectedRoute>} />
        <Route path="/avisos" element={<ProtectedRoute><Avisos /></ProtectedRoute>} />
        <Route path="/visitantes" element={<ProtectedRoute><Visitantes /></ProtectedRoute>} />
        <Route path="/reservas" element={<ProtectedRoute><Reservas /></ProtectedRoute>} />
        <Route path="/chamados" element={<ProtectedRoute><Chamados /></ProtectedRoute>} />
        <Route path="/financeiro" element={<ProtectedRoute><Financeiro /></ProtectedRoute>} />
        <Route path="/gestor-maximo" element={<ProtectedRoute><GestorMaximo /></ProtectedRoute>} />
        <Route path="/perfil" element={<ProtectedRoute><Perfil /></ProtectedRoute>} />
        <Route path="/usuarios" element={<ProtectedRoute><Usuarios /></ProtectedRoute>} />
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
