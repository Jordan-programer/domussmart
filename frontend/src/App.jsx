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

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/moradores" element={<Moradores />} />
        <Route path="/unidades" element={<Unidades />} />
        <Route path="/blocos" element={<Blocos />} />
        <Route path="/condominio" element={<Condominio />} />
        <Route path="/avisos" element={<Avisos />} />
        <Route path="/visitantes" element={<Visitantes />} />
        <Route path="/reservas" element={<Reservas />} />
        <Route path="/chamados" element={<Chamados />} />
        <Route path="/financeiro" element={<Financeiro />} />
        <Route path="/gestor-maximo" element={<GestorMaximo />} />
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
