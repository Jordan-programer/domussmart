import React from 'react';
import Layout from '../components/Layout';
import { Users, Building, Wrench, CreditCard } from 'lucide-react';

export default function Dashboard() {
  return (
    <Layout>
      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        <StatCard title="Total Moradores" value="124" subtext="+3 este mês" icon={<Users size={24} color="#6366f1" />} />
        <StatCard title="Unidades" value="80" subtext="95% ocupadas" icon={<Building size={24} color="#ec4899" />} />
        <StatCard title="Chamados Abertos" value="7" subtext="3 urgentes" icon={<Wrench size={24} color="#f43f5e" />} />
        <StatCard title="Inadimplência" value="4.2%" subtext="-1.5% este mês" icon={<CreditCard size={24} color="#10b981" />} />
      </div>

      {/* Recent Activity or Quick Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        {/* Main Card */}
        <div className="glass" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '20px', color: 'white' }}>Últimos Chamados</h3>
          <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px' }}>
            Nenhum chamado pendente no momento.
          </div>
        </div>

        {/* Side Card */}
        <div className="glass" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '20px', color: 'white' }}>Avisos Rápidos</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="glass-card" style={{ padding: '12px' }}>
              <p style={{ fontSize: '0.875rem', fontWeight: '500', color: 'white' }}>Manutenção do Elevador</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Amanhã das 14h às 16h.</p>
            </div>
            <div className="glass-card" style={{ padding: '12px' }}>
              <p style={{ fontSize: '0.875rem', fontWeight: '500', color: 'white' }}>Festa Junina</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Confirmada para o dia 20/06.</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

function StatCard({ title, value, subtext, icon }) {
  return (
    <div className="glass-card" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '4px' }}>{title}</p>
        <p style={{ fontSize: '1.75rem', fontWeight: 'bold', color: 'white' }}>{value}</p>
        <p style={{ color: subtext.startsWith('+') ? '#10b981' : subtext.startsWith('-') ? '#f43f5e' : 'var(--text-muted)', fontSize: '0.75rem', marginTop: '4px' }}>{subtext}</p>
      </div>
      <div style={{ background: 'rgba(255,255,255,0.03)', width: '48px', height: '48px', display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: '12px' }}>
        {icon}
      </div>
    </div>
  );
}
