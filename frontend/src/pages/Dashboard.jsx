import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { 
  Users, Building, Wrench, CreditCard, Bell, Calendar, UserPlus, 
  TrendingUp, CheckCircle, Clock, AlertCircle
} from 'lucide-react';
import axios from 'axios';

export default function Dashboard() {
  const role = localStorage.getItem('role') || 'SINDICO';
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  const [stats, setStats] = useState({
    // SINDICO stats
    totalMoradores: 0,
    totalUnidades: 0,
    chamadosAbertos: 0,
    taxasPendentes: 0,
    // MORADOR stats
    meusChamados: 0,
    minhasReservas: 0,
    taxasEmAberto: 0,
    meusVisitantes: 0
  });

  const [recentChamados, setRecentChamados] = useState([]);
  const [recentAvisos, setRecentAvisos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      window.location.href = '/login';
      return;
    }
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch global notices (Avisos) for everyone
      const avisosRes = await axios.get('http://localhost:8080/api/v1/avisos', { headers });
      setRecentAvisos(avisosRes.data.slice(0, 3)); // show top 3 recent notices

      // Fetch calls (Chamados) for everyone (restricted by role in backend)
      const chamadosRes = await axios.get('http://localhost:8080/api/v1/chamados', { headers });
      setRecentChamados(chamadosRes.data.slice(0, 4));

      if (role === 'MORADOR') {
        // Fetch morador specific datasets
        const reservasRes = await axios.get('http://localhost:8080/api/v1/reservas', { headers });
        const taxasRes = await axios.get('http://localhost:8080/api/v1/taxas-condominiais', { headers });
        const visitantesRes = await axios.get('http://localhost:8080/api/v1/visitantes', { headers });

        setStats({
          meusChamados: chamadosRes.data.filter(c => c.status !== 'CONCLUIDO').length,
          minhasReservas: reservasRes.data.length,
          taxasEmAberto: taxasRes.data.filter(t => !t.paga).length,
          meusVisitantes: visitantesRes.data.length
        });
      } else {
        // SINDICO / ADMIN
        const moradoresRes = await axios.get('http://localhost:8080/api/v1/moradores', { headers });
        const unidadesRes = await axios.get('http://localhost:8080/api/v1/unidades', { headers });
        const taxasRes = await axios.get('http://localhost:8080/api/v1/taxas-condominiais', { headers });

        setStats({
          totalMoradores: moradoresRes.data.length,
          totalUnidades: unidadesRes.data.length,
          chamadosAbertos: chamadosRes.data.filter(c => c.status === 'ABERTO').length,
          taxasPendentes: taxasRes.data.filter(t => !t.paga).length
        });
      }

      setLoading(false);
    } catch (err) {
      console.error('Erro ao carregar dados do dashboard:', err);
      setLoading(false);
    }
  };

  return (
    <Layout>
      {loading ? (
        <div style={{ color: 'white', textAlign: 'center', padding: '40px', fontSize: '1.2rem' }}>
          Carregando informações do painel...
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '32px' }}>
            {role === 'MORADOR' ? (
              <>
                <StatCard 
                  title="Minhas Taxas Abertas" 
                  value={stats.taxasEmAberto} 
                  subtext={stats.taxasEmAberto > 0 ? "Requer atenção" : "Tudo em dia!"} 
                  icon={<CreditCard size={24} color="#f43f5e" />} 
                  cardColor={stats.taxasEmAberto > 0 ? "rgba(244, 63, 94, 0.05)" : "transparent"}
                />
                <StatCard 
                  title="Meus Chamados Ativos" 
                  value={stats.meusChamados} 
                  subtext="Suporte em andamento" 
                  icon={<Wrench size={24} color="#6366f1" />} 
                  cardColor="transparent"
                />
                <StatCard 
                  title="Minhas Reservas" 
                  value={stats.minhasReservas} 
                  subtext="Áreas comuns agendadas" 
                  icon={<Calendar size={24} color="#ec4899" />} 
                  cardColor="transparent"
                />
                <StatCard 
                  title="Visitantes Cadastrados" 
                  value={stats.meusVisitantes} 
                  subtext="Controle de acesso ativo" 
                  icon={<Users size={24} color="#10b981" />} 
                  cardColor="transparent"
                />
              </>
            ) : (
              <>
                <StatCard 
                  title="Total Moradores" 
                  value={stats.totalMoradores} 
                  subtext="Moradores registrados" 
                  icon={<Users size={24} color="#6366f1" />} 
                  cardColor="transparent"
                />
                <StatCard 
                  title="Unidades Registradas" 
                  value={stats.totalUnidades} 
                  subtext="Apartamentos/Casas" 
                  icon={<Building size={24} color="#ec4899" />} 
                  cardColor="transparent"
                />
                <StatCard 
                  title="Chamados em Aberto" 
                  value={stats.chamadosAbertos} 
                  subtext={stats.chamadosAbertos > 0 ? "Pendente de atenção" : "Nenhum pendente"} 
                  icon={<Wrench size={24} color="#f43f5e" />} 
                  cardColor={stats.chamadosAbertos > 0 ? "rgba(244, 63, 94, 0.05)" : "transparent"}
                />
                <StatCard 
                  title="Inadimplências Ativas" 
                  value={stats.taxasPendentes} 
                  subtext="Taxas não pagas" 
                  icon={<CreditCard size={24} color="#10b981" />} 
                  cardColor="transparent"
                />
              </>
            )}
          </div>

          {/* Activity / Notice Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px' }}>
            
            {/* Chamados Card */}
            <div className="glass" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: 'white' }}>
                  {role === 'MORADOR' ? 'Meus Chamados Recentes' : 'Chamados Recentes do Condomínio'}
                </h3>
                <span style={{ fontSize: '0.75rem', padding: '4px 8px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', color: 'var(--text-muted)' }}>
                  Total: {recentChamados.length}
                </span>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {recentChamados.length > 0 ? (
                  recentChamados.map(c => (
                    <div key={c.id} className="glass-card" style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ flex: 1, marginRight: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                          <span style={{ 
                            fontSize: '0.7rem', fontWeight: 'bold', padding: '2px 6px', borderRadius: '4px',
                            background: c.status === 'ABERTO' ? 'rgba(244, 63, 94, 0.15)' : c.status === 'EM_ANDAMENTO' ? 'rgba(99, 102, 241, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                            color: c.status === 'ABERTO' ? '#f43f5e' : c.status === 'EM_ANDAMENTO' ? '#6366f1' : '#10b981'
                          }}>
                            {c.status}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            Bloco {c.unidade?.bloco?.nome} - Apto {c.unidade?.numero}
                          </span>
                        </div>
                        <p style={{ color: 'white', fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                          {c.descricao}
                        </p>
                      </div>
                      <div>
                        {c.status === 'CONCLUIDO' ? (
                          <CheckCircle size={18} color="#10b981" />
                        ) : c.status === 'EM_ANDAMENTO' ? (
                          <Clock size={18} color="#6366f1" />
                        ) : (
                          <AlertCircle size={18} color="#f43f5e" />
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px' }}>
                    Nenhum chamado pendente no momento.
                  </div>
                )}
              </div>
            </div>

            {/* Avisos Card */}
            <div className="glass" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: 'white' }}>Quadro de Avisos</h3>
                <Bell size={18} style={{ color: 'var(--primary)' }} />
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {recentAvisos.length > 0 ? (
                  recentAvisos.map(a => (
                    <div key={a.id} className="glass-card" style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontWeight: '600', color: 'white', fontSize: '0.9rem' }}>{a.titulo}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {a.dataPublicacao ? new Date(a.dataPublicacao).toLocaleDateString('pt-BR') : ''}
                        </span>
                      </div>
                      <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', lineHeight: '1.4' }}>
                        {a.conteudo}
                      </p>
                    </div>
                  ))
                ) : (
                  <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px' }}>
                    Nenhum aviso publicado recentemente.
                  </div>
                )}
              </div>
            </div>

          </div>
        </>
      )}
    </Layout>
  );
}

function StatCard({ title, value, subtext, icon, cardColor }) {
  return (
    <div 
      className="glass-card" 
      style={{ 
        padding: '24px', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        background: cardColor !== 'transparent' ? cardColor : 'var(--glass-bg)',
        border: cardColor !== 'transparent' ? '1px solid rgba(244, 63, 94, 0.2)' : '1px solid rgba(255,255,255,0.05)',
        transition: 'transform 0.2s ease',
        cursor: 'default'
      }}
      onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
      onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
    >
      <div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '4px' }}>{title}</p>
        <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white', margin: 0 }}>{value}</p>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '4px', margin: 0 }}>{subtext}</p>
      </div>
      <div style={{ background: 'rgba(255,255,255,0.03)', width: '48px', height: '48px', display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: '12px' }}>
        {icon}
      </div>
    </div>
  );
}
