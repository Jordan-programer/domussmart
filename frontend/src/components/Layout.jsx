import React from 'react';
import { 
  LayoutDashboard, Users, Building, Bell, Calendar, 
  Wrench, CreditCard, LogOut, Search, User, Globe, Box, Shield
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export default function Layout({ children }) {
  const location = useLocation();
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', background: 'var(--background)' }}>
      {/* Sidebar */}
      <div className="glass" style={{ width: '260px', height: '100%', borderRadius: '0 16px 16px 0', padding: '24px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ marginBottom: '40px', textAlign: 'center' }}>
          <h1 className="text-gradient" style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>DomuSmart</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Painel Administrativo</p>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
          <SidebarLink to="/dashboard" icon={<LayoutDashboard size={20} />} text="Dashboard" active={location.pathname === '/dashboard'} />
          {localStorage.getItem('role') === 'ADMIN' && (
            <SidebarLink to="/gestor-maximo" icon={<Shield size={20} />} text="Gestor Máximo" active={location.pathname === '/gestor-maximo'} />
          )}
          <SidebarLink to="/condominio" icon={<Globe size={20} />} text="Meu Condomínio" active={location.pathname === '/condominio'} />

          <SidebarLink to="/blocos" icon={<Box size={20} />} text="Blocos" active={location.pathname === '/blocos'} />
          <SidebarLink to="/unidades" icon={<Building size={20} />} text="Unidades" active={location.pathname === '/unidades'} />
          <SidebarLink to="/moradores" icon={<Users size={20} />} text="Moradores" active={location.pathname === '/moradores'} />
          <SidebarLink to="/visitantes" icon={<User size={20} />} text="Visitantes" active={location.pathname === '/visitantes'} />
          <SidebarLink to="/avisos" icon={<Bell size={20} />} text="Avisos" active={location.pathname === '/avisos'} />

          <SidebarLink to="/reservas" icon={<Calendar size={20} />} text="Reservas" active={location.pathname === '/reservas'} />
          <SidebarLink to="/chamados" icon={<Wrench size={20} />} text="Chamados" active={location.pathname === '/chamados'} />
          <SidebarLink to="/financeiro" icon={<CreditCard size={20} />} text="Financeiro" active={location.pathname === '/financeiro'} />
        </nav>

        <button 
          onClick={handleLogout}
          style={{ 
            display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', 
            color: '#f43f5e', background: 'transparent', width: '100%', 
            borderRadius: '12px', transition: 'all 0.3s ease' 
          }}
          onMouseOver={(e) => e.target.style.background = 'rgba(244, 63, 94, 0.1)'}
          onMouseOut={(e) => e.target.style.background = 'transparent'}
        >
          <LogOut size={20} />
          <span style={{ fontWeight: '500' }}>Sair</span>
        </button>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: '600', color: 'white' }}>{localStorage.getItem('condominioNome') || 'Painel de Controle'}</h2>
            <p style={{ color: 'var(--text-muted)' }}>{localStorage.getItem('condominioNome') ? 'Gestão de Condomínio' : 'Gestão inteligente de condomínio.'}</p>
          </div>


          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div style={{ position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                placeholder="Buscar..." 
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '10px 12px 10px 40px', color: 'white', width: '250px' }}
              />
            </div>
            <div className="glass" style={{ width: '40px', height: '40px', display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: '50%', cursor: 'pointer' }}>
              <User size={20} color="white" />
            </div>
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
      onMouseOver={(e) => { if(!active) e.target.style.background = 'rgba(255,255,255,0.02)'; e.target.style.color = 'white'; }}
      onMouseOut={(e) => { if(!active) e.target.style.background = 'transparent'; if(!active) e.target.style.color = 'var(--text-muted)'; }}
    >
      {icon}
      <span>{text}</span>
    </Link>
  );
}
