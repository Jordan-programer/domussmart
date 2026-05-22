import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Users, Building, Bell, Calendar, 
  Wrench, CreditCard, LogOut, User, Globe, Box, Shield, UserCheck,
  Menu, X
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export default function Layout({ children }) {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  useEffect(() => {
    // Close sidebar on navigate
    setSidebarOpen(false);
  }, [location.pathname]);
  
  useEffect(() => {
    const role = localStorage.getItem('role');
    const path = location.pathname;
    
    if (role === 'ADMIN') {
      if (path !== '/gestor-maximo' && path !== '/perfil') {
        window.location.href = '/gestor-maximo';
      }
    } else if (role === 'PORTEIRO') {
      const porteiroAllowedPaths = ['/portaria', '/visitantes', '/moradores', '/avisos', '/chamados', '/perfil'];
      if (!porteiroAllowedPaths.includes(path)) {
        window.location.href = '/portaria';
      }
    } else if (role === 'MORADOR') {
      const moradorAllowedPaths = ['/dashboard', '/avisos', '/reservas', '/chamados', '/financeiro', '/visitantes', '/perfil'];
      if (!moradorAllowedPaths.includes(path)) {
        window.location.href = '/dashboard';
      }
    } else {
      // SINDICO
      const otherForbiddenPaths = ['/gestor-maximo', '/portaria'];
      if (otherForbiddenPaths.includes(path)) {
        window.location.href = '/dashboard';
      }
    }
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  return (
    <div className="app-container">
      {/* Sidebar Backdrop (Mobile only) */}
      <div 
        className={`sidebar-backdrop ${sidebarOpen ? 'open' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Mobile Topbar */}
      <div className="mobile-topbar">
        <button 
          className="menu-toggle-btn"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label="Toggle Menu"
        >
          {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img 
            src="/favicon.png" 
            alt="Logo" 
            style={{ width: '32px', height: '32px', borderRadius: '8px', objectFit: 'cover' }} 
          />
          <h1 className="text-gradient" style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: 0 }}>DomuSmart</h1>
        </div>

        <Link 
          to="/perfil" 
          className="glass" 
          style={{ 
            width: '38px', 
            height: '38px', 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            borderRadius: '50%',
            border: location.pathname === '/perfil' ? '1px solid #60a5fa' : '1px solid rgba(255,255,255,0.1)',
            textDecoration: 'none'
          }}
        >
          <User size={18} color="white" />
        </Link>
      </div>

      {/* Sidebar */}
      <div className={`glass sidebar-container ${sidebarOpen ? 'open' : ''}`}>
        <div style={{ marginBottom: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <img 
            src="/favicon.png" 
            alt="DomuSmart Logo" 
            style={{ 
              width: '64px', 
              height: '64px', 
              borderRadius: '16px', 
              boxShadow: '0 8px 24px rgba(96, 165, 250, 0.25)', 
              border: '1px solid rgba(255, 255, 255, 0.15)',
              objectFit: 'cover'
            }} 
          />
          <div style={{ textAlign: 'center' }}>
            <h1 className="text-gradient" style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>DomuSmart</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: '4px 0 0 0' }}>Painel Administrativo</p>
          </div>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, overflowY: 'auto' }}>
          {localStorage.getItem('role') === 'ADMIN' ? (
            <SidebarLink to="/gestor-maximo" icon={<Shield size={20} />} text="Gestor Máximo" active={location.pathname === '/gestor-maximo'} />
          ) : localStorage.getItem('role') === 'PORTEIRO' ? (
            <>
              <SidebarLink to="/portaria" icon={<LayoutDashboard size={20} />} text="Portaria" active={location.pathname === '/portaria'} />
              <SidebarLink to="/visitantes" icon={<User size={20} />} text="Visitantes" active={location.pathname === '/visitantes'} />
              <SidebarLink to="/moradores" icon={<Users size={20} />} text="Moradores" active={location.pathname === '/moradores'} />
              <SidebarLink to="/avisos" icon={<Bell size={20} />} text="Avisos" active={location.pathname === '/avisos'} />
              <SidebarLink to="/chamados" icon={<Wrench size={20} />} text="Chamados" active={location.pathname === '/chamados'} />
            </>
          ) : localStorage.getItem('role') === 'MORADOR' ? (
            <>
              <SidebarLink to="/dashboard" icon={<LayoutDashboard size={20} />} text="Dashboard" active={location.pathname === '/dashboard'} />
              <SidebarLink to="/visitantes" icon={<User size={20} />} text="Visitantes" active={location.pathname === '/visitantes'} />
              <SidebarLink to="/avisos" icon={<Bell size={20} />} text="Avisos" active={location.pathname === '/avisos'} />
              <SidebarLink to="/reservas" icon={<Calendar size={20} />} text="Reservas" active={location.pathname === '/reservas'} />
              <SidebarLink to="/chamados" icon={<Wrench size={20} />} text="Chamados" active={location.pathname === '/chamados'} />
              <SidebarLink to="/financeiro" icon={<CreditCard size={20} />} text="Financeiro" active={location.pathname === '/financeiro'} />
            </>
          ) : (
            <>
              <SidebarLink to="/dashboard" icon={<LayoutDashboard size={20} />} text="Dashboard" active={location.pathname === '/dashboard'} />
              <SidebarLink to="/condominio" icon={<Globe size={20} />} text="Meu Condomínio" active={location.pathname === '/condominio'} />
              <SidebarLink to="/blocos" icon={<Box size={20} />} text="Blocos" active={location.pathname === '/blocos'} />
              <SidebarLink to="/unidades" icon={<Building size={20} />} text="Unidades" active={location.pathname === '/unidades'} />
              <SidebarLink to="/moradores" icon={<Users size={20} />} text="Moradores" active={location.pathname === '/moradores'} />
              <SidebarLink to="/usuarios" icon={<UserCheck size={20} />} text="Usuários do Sistema" active={location.pathname === '/usuarios'} />
              <SidebarLink to="/visitantes" icon={<User size={20} />} text="Visitantes" active={location.pathname === '/visitantes'} />
              <SidebarLink to="/avisos" icon={<Bell size={20} />} text="Avisos" active={location.pathname === '/avisos'} />
              <SidebarLink to="/reservas" icon={<Calendar size={20} />} text="Reservas" active={location.pathname === '/reservas'} />
              <SidebarLink to="/chamados" icon={<Wrench size={20} />} text="Chamados" active={location.pathname === '/chamados'} />
              <SidebarLink to="/financeiro" icon={<CreditCard size={20} />} text="Financeiro" active={location.pathname === '/financeiro'} />
            </>
          )}
        </nav>

        <button 
          onClick={handleLogout}
          style={{ 
            display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', 
            color: '#f43f5e', background: 'transparent', width: '100%', 
            borderRadius: '12px', transition: 'all 0.3s ease', marginTop: '16px',
            border: 'none', outline: 'none'
          }}
          onMouseOver={(e) => e.currentTarget.style.background = 'rgba(244, 63, 94, 0.1)'}
          onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
        >
          <LogOut size={20} />
          <span style={{ fontWeight: '500' }}>Sair</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="main-content-container">
        {/* Desktop Header (Hidden on Mobile) */}
        <div className="desktop-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: '600', color: 'white' }}>{localStorage.getItem('condominioNome') || 'Painel de Controle'}</h2>
            <p style={{ color: 'var(--text-muted)' }}>
              {localStorage.getItem('role') === 'PORTEIRO' 
                ? 'Controle de Acesso e Portaria' 
                : localStorage.getItem('condominioNome') 
                  ? 'Gestão de Condomínio' 
                  : 'Gestão inteligente de condomínio.'}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <Link 
              to="/perfil" 
              className="glass" 
              style={{ 
                width: '40px', 
                height: '40px', 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                borderRadius: '50%', 
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                border: location.pathname === '/perfil' ? '1px solid #60a5fa' : '1px solid rgba(255,255,255,0.1)',
                textDecoration: 'none'
              }}
              onMouseOver={(e) => e.currentTarget.style.boxShadow = '0 0 12px rgba(96, 165, 250, 0.4)'}
              onMouseOut={(e) => e.currentTarget.style.boxShadow = 'none'}
            >
              <User size={20} color="white" />
            </Link>
          </div>
        </div>

        {children}
      </div>
    </div>
  );
}

function SidebarLink({ to, icon, text, active }) {
  return (
    <Link 
      to={to}
      style={{ 
        display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', 
        borderRadius: '12px', cursor: 'pointer',
        background: active ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
        color: active ? 'white' : 'var(--text-muted)',
        fontWeight: active ? '600' : '400',
        transition: 'all 0.3s ease',
        textDecoration: 'none'
      }}
      onMouseOver={(e) => { if(!active) { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; e.currentTarget.style.color = 'white'; } }}
      onMouseOut={(e) => { if(!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; } }}
    >
      {icon}
      <span>{text}</span>
    </Link>
  );
}
