import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { 
  Users, User, Home, Search, Plus, Check, Clock, 
  Megaphone, Phone, Mail, Pin, ShieldAlert, X, CreditCard
} from 'lucide-react';
import axios from 'axios';

export default function Portaria() {
  const [visitantes, setVisitantes] = useState([]);
  const [unidades, setUnidades] = useState([]);
  const [moradores, setMoradores] = useState([]);
  const [avisos, setAvisos] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Search and Filter States
  const [visitorSearch, setVisitorSearch] = useState('');
  const [residentSearch, setResidentSearch] = useState('');
  
  // Registration Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    nif: '',
    unidadeId: ''
  });

  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');
  const headers = { Authorization: `Bearer ${token}` };

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
      const [resVisitantes, resUnidades, resMoradores, resAvisos] = await Promise.all([
        axios.get('http://localhost:8080/api/v1/visitantes', { headers }),
        axios.get('http://localhost:8080/api/v1/unidades', { headers }),
        axios.get('http://localhost:8080/api/v1/moradores', { headers }),
        axios.get('http://localhost:8080/api/v1/avisos', { headers })
      ]);

      setVisitantes(resVisitantes.data);
      setUnidades(resUnidades.data);
      setMoradores(resMoradores.data);
      setAvisos(resAvisos.data);
      setLoading(false);
    } catch (err) {
      setError('Erro ao carregar os dados da portaria.');
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleQuickCheckout = async (visitante) => {
    try {
      const payload = {
        ...visitante,
        dataHoraSaida: new Date().toISOString()
      };
      await axios.post('http://localhost:8080/api/v1/visitantes', payload, { headers });
      
      // Update local state instantly
      setVisitantes(prev => 
        prev.map(v => v.id === visitante.id ? { ...v, dataHoraSaida: payload.dataHoraSaida } : v)
      );
    } catch (err) {
      alert('Erro ao registrar saída do visitante.');
    }
  };

  const handleSubmitVisitor = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        nome: formData.nome,
        nif: formData.nif,
        unidade: { id: parseInt(formData.unidadeId) },
        registradoPor: { id: parseInt(userId) },
        dataHoraEntrada: new Date().toISOString()
      };

      const response = await axios.post('http://localhost:8080/api/v1/visitantes', payload, { headers });
      
      // Update list and close modal
      setIsModalOpen(false);
      setFormData({ nome: '', nif: '', unidadeId: '' });
      
      // Fetch fresh list
      const resVisitantes = await axios.get('http://localhost:8080/api/v1/visitantes', { headers });
      setVisitantes(resVisitantes.data);
    } catch (err) {
      alert('Erro ao registrar novo visitante. Verifique os campos.');
    }
  };

  // Helper Functions
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const isToday = (dateString) => {
    if (!dateString) return false;
    const date = new Date(dateString);
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  };

  // Filtered lists
  const activeVisitors = visitantes.filter(v => !v.dataHoraSaida);
  const filteredActiveVisitors = activeVisitors.filter(v => {
    const search = visitorSearch.toLowerCase();
    return (
      v.nome.toLowerCase().includes(search) ||
      (v.nif && v.nif.toLowerCase().includes(search)) ||
      (v.unidade?.numero && v.unidade.numero.toLowerCase().includes(search))
    );
  });

  const filteredMoradores = moradores.filter(m => {
    const search = residentSearch.toLowerCase();
    return (
      m.nome.toLowerCase().includes(search) ||
      (m.unidade?.numero && m.unidade.numero.toLowerCase().includes(search)) ||
      (m.telefone && m.telefone.includes(search))
    );
  });

  // Today's entries
  const visitorsTodayCount = visitantes.filter(v => isToday(v.dataHoraEntrada)).length;

  // Sorted announcements (pinned first, then date)
  const sortedAvisos = [...avisos].sort((a, b) => {
    if (a.fixado && !b.fixado) return -1;
    if (!a.fixado && b.fixado) return 1;
    return new Date(b.dataCriacao) - new Date(a.dataCriacao);
  }).slice(0, 4); // Show top 4 notices

  return (
    <Layout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Welcome and Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'white', margin: 0 }}>
              Controle de Portaria & Acesso
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '4px' }}>
              Gestão em tempo real de visitantes, moradores e segurança perimetral.
            </p>
          </div>

          <button 
            className="btn-primary" 
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', borderRadius: '12px' }}
            onClick={() => setIsModalOpen(true)}
          >
            <Plus size={18} />
            <span>Registrar Entrada</span>
          </button>
        </div>

        {loading ? (
          <div style={{ color: 'white', textAlign: 'center', padding: '60px' }}>
            <div className="loader" style={{ marginBottom: '16px' }}></div>
            Carregando dados da Portaria...
          </div>
        ) : error ? (
          <div className="glass" style={{ color: '#ef4444', textAlign: 'center', padding: '32px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            <ShieldAlert size={40} style={{ margin: '0 auto 12px auto' }} />
            {error}
          </div>
        ) : (
          <>
            {/* Stats Metrics Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
              
              {/* Card: Active Visitors */}
              <div className="glass" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px', borderLeft: '4px solid #10b981', position: 'relative', overflow: 'hidden' }}>
                <div style={{ padding: '12px', background: 'rgba(16, 185, 129, 0.15)', borderRadius: '12px', color: '#10b981' }}>
                  <User size={24} />
                </div>
                <div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', margin: 0 }}>
                    Visitantes no Condomínio
                  </p>
                  <h4 style={{ fontSize: '2rem', fontWeight: '700', color: 'white', margin: '4px 0 0 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {activeVisitors.length}
                    {activeVisitors.length > 0 && (
                      <span className="pulse-dot" style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }}></span>
                    )}
                  </h4>
                </div>
              </div>

              {/* Card: Today's Entries */}
              <div className="glass" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px', borderLeft: '4px solid #3b82f6' }}>
                <div style={{ padding: '12px', background: 'rgba(59, 130, 246, 0.15)', borderRadius: '12px', color: '#3b82f6' }}>
                  <Clock size={24} />
                </div>
                <div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', margin: 0 }}>
                    Entradas Hoje
                  </p>
                  <h4 style={{ fontSize: '2rem', fontWeight: '700', color: 'white', margin: '4px 0 0 0' }}>
                    {visitorsTodayCount}
                  </h4>
                </div>
              </div>

              {/* Card: Registered Residents */}
              <div className="glass" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px', borderLeft: '4px solid #8b5cf6' }}>
                <div style={{ padding: '12px', background: 'rgba(139, 92, 246, 0.15)', borderRadius: '12px', color: '#8b5cf6' }}>
                  <Users size={24} />
                </div>
                <div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', margin: 0 }}>
                    Moradores Totais
                  </p>
                  <h4 style={{ fontSize: '2rem', fontWeight: '700', color: 'white', margin: '4px 0 0 0' }}>
                    {moradores.length}
                  </h4>
                </div>
              </div>

              {/* Card: Units list */}
              <div className="glass" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px', borderLeft: '4px solid #f59e0b' }}>
                <div style={{ padding: '12px', background: 'rgba(245, 158, 11, 0.15)', borderRadius: '12px', color: '#f59e0b' }}>
                  <Home size={24} />
                </div>
                <div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', margin: 0 }}>
                    Unidades Mapeadas
                  </p>
                  <h4 style={{ fontSize: '2rem', fontWeight: '700', color: 'white', margin: '4px 0 0 0' }}>
                    {unidades.length}
                  </h4>
                </div>
              </div>

            </div>

            {/* Split Screen Panel Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', alignItems: 'start' }}>
              
              {/* Left Column: Active Visitors List */}
              <div className="glass" style={{ padding: '24px', minHeight: '450px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <h5 style={{ fontSize: '1.1rem', fontWeight: '600', color: 'white', margin: 0 }}>
                      Visitantes Ativos no Condomínio
                    </h5>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', margin: '4px 0 0 0' }}>
                      Pessoas autorizadas atualmente nas dependências.
                    </p>
                  </div>
                  
                  {/* Visitor Search Input */}
                  <div style={{ position: 'relative' }}>
                    <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input 
                      type="text" 
                      placeholder="Pesquisar visitante..." 
                      value={visitorSearch}
                      onChange={(e) => setVisitorSearch(e.target.value)}
                      style={{ 
                        padding: '8px 12px 8px 36px', 
                        background: 'rgba(255,255,255,0.05)', 
                        border: '1px solid rgba(255,255,255,0.1)', 
                        borderRadius: '10px', 
                        color: 'white',
                        fontSize: '0.85rem',
                        width: '200px'
                      }}
                    />
                  </div>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', color: 'white' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'left' }}>
                        <th style={{ padding: '12px 8px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Nome</th>
                        <th style={{ padding: '12px 8px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>NIF</th>
                        <th style={{ padding: '12px 8px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Destino</th>
                        <th style={{ padding: '12px 8px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Entrada</th>
                        <th style={{ padding: '12px 8px', color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center' }}>Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredActiveVisitors.map((visitante) => (
                        <tr key={visitante.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'all 0.2s' }}>
                          <td style={{ padding: '12px 8px', fontWeight: '500' }}>{visitante.nome}</td>
                          <td style={{ padding: '12px 8px', color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' }}>{visitante.nif || '-'}</td>
                          <td style={{ padding: '12px 8px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <span style={{ fontSize: '0.875rem' }}>Unidade {visitante.unidade?.numero || 'N/A'}</span>
                              <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{visitante.unidade?.bloco?.nome || ''}</span>
                            </div>
                          </td>
                          <td style={{ padding: '12px 8px', fontSize: '0.85rem', color: '#60a5fa' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <Clock size={12} />
                              {formatDate(visitante.dataHoraEntrada)}
                            </div>
                          </td>
                          <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                            <button 
                              onClick={() => handleQuickCheckout(visitante)}
                              style={{ 
                                background: 'rgba(16, 185, 129, 0.15)', 
                                color: '#10b981', 
                                border: '1px solid rgba(16, 185, 129, 0.3)', 
                                padding: '6px 12px', 
                                borderRadius: '8px', 
                                cursor: 'pointer', 
                                display: 'inline-flex', 
                                alignItems: 'center', 
                                gap: '6px',
                                fontSize: '0.8rem',
                                transition: 'all 0.2s'
                              }}
                              onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(16, 185, 129, 0.3)' }}
                              onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(16, 185, 129, 0.15)' }}
                            >
                              <Check size={14} />
                              Registrar Saída
                            </button>
                          </td>
                        </tr>
                      ))}
                      {filteredActiveVisitors.length === 0 && (
                        <tr>
                          <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                            Nenhum visitante ativo encontrado no momento.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Right Column: Quick Finder & Announcements */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                
                {/* Panel: Resident & Unit Quick Directory */}
                <div className="glass" style={{ padding: '24px' }}>
                  <h5 style={{ fontSize: '1.1rem', fontWeight: '600', color: 'white', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Search size={18} color="#60a5fa" />
                    Localizador de Moradores
                  </h5>

                  {/* Finder Search */}
                  <div style={{ position: 'relative', marginBottom: '16px' }}>
                    <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input 
                      type="text" 
                      placeholder="Nome, unidade ou telefone..." 
                      value={residentSearch}
                      onChange={(e) => setResidentSearch(e.target.value)}
                      style={{ 
                        width: '100%',
                        padding: '10px 12px 10px 38px', 
                        background: 'rgba(255,255,255,0.05)', 
                        border: '1px solid rgba(255,255,255,0.1)', 
                        borderRadius: '10px', 
                        color: 'white',
                        fontSize: '0.85rem'
                      }}
                    />
                  </div>

                  {/* Search Output list */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '200px', overflowY: 'auto', paddingRight: '4px' }}>
                    {residentSearch ? (
                      filteredMoradores.slice(0, 5).map((morador) => (
                        <div key={morador.id} style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontWeight: '600', color: 'white', fontSize: '0.875rem' }}>{morador.nome}</span>
                            <span style={{ background: 'rgba(96, 165, 250, 0.15)', color: '#60a5fa', fontSize: '0.75rem', padding: '2px 6px', borderRadius: '4px' }}>
                              Unidade {morador.unidade?.numero || 'S/N'}
                            </span>
                          </div>
                          {morador.telefone && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                              <Phone size={12} />
                              <span>{morador.telefone}</span>
                            </div>
                          )}
                          {morador.email && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                              <Mail size={12} />
                              <span style={{ wordBreak: 'break-all' }}>{morador.email}</span>
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textAlign: 'center', margin: '20px 0' }}>
                        Comece a digitar para localizar contatos de moradores.
                      </p>
                    )}
                    {residentSearch && filteredMoradores.length === 0 && (
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textAlign: 'center', margin: '20px 0' }}>
                        Nenhum morador encontrado.
                      </p>
                    )}
                  </div>
                </div>

                {/* Panel: Pinned Announcements */}
                <div className="glass" style={{ padding: '24px' }}>
                  <h5 style={{ fontSize: '1.1rem', fontWeight: '600', color: 'white', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Megaphone size={18} color="#f59e0b" />
                    Mural de Avisos Recentes
                  </h5>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {sortedAvisos.map((aviso) => (
                      <div 
                        key={aviso.id} 
                        style={{ 
                          padding: '12px', 
                          background: aviso.fixado ? 'rgba(245, 158, 11, 0.05)' : 'rgba(255,255,255,0.02)', 
                          border: aviso.fixado ? '1px solid rgba(245, 158, 11, 0.2)' : '1px solid rgba(255,255,255,0.05)',
                          borderRadius: '10px',
                          position: 'relative'
                        }}
                      >
                        {aviso.fixado && (
                          <div style={{ position: 'absolute', top: '10px', right: '10px', color: '#f59e0b' }} title="Fixado">
                            <Pin size={12} />
                          </div>
                        )}
                        <h6 style={{ color: 'white', fontWeight: '600', margin: '0 0 4px 0', fontSize: '0.85rem', paddingRight: aviso.fixado ? '16px' : '0' }}>
                          {aviso.titulo}
                        </h6>
                        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem', margin: 0, lineHeight: '1.4' }}>
                          {aviso.descricao}
                        </p>
                      </div>
                    ))}
                    {sortedAvisos.length === 0 && (
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textAlign: 'center', padding: '16px 0', margin: 0 }}>
                        Sem avisos no mural.
                      </p>
                    )}
                  </div>
                </div>

              </div>

            </div>
          </>
        )}
      </div>

      {/* Modal: New Visitor Entrance Registration */}
      {isModalOpen && (
        <div style={{ 
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', 
          background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)', 
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 
        }}>
          <div className="glass" style={{ width: '100%', maxWidth: '450px', padding: '32px', position: 'relative' }}>
            <button 
              onClick={() => setIsModalOpen(false)}
              style={{ position: 'absolute', top: '20px', right: '20px', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>

            <h3 style={{ fontSize: '1.35rem', fontWeight: '700', marginBottom: '24px', color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <User size={20} color="#10b981" />
              Registrar Novo Visitante
            </h3>

            <form onSubmit={handleSubmitVisitor} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Visitor Name */}
              <div style={{ position: 'relative' }}>
                <User size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="text" 
                  name="nome" 
                  placeholder="Nome Completo do Visitante" 
                  value={formData.nome} 
                  onChange={handleInputChange}
                  style={{ width: '100%', padding: '12px 12px 12px 40px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white' }}
                  required
                />
              </div>

              {/* NIF */}
              <div style={{ position: 'relative' }}>
                <CreditCard size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="text" 
                  name="nif" 
                  placeholder="NIF (Opcional)" 
                  value={formData.nif} 
                  onChange={handleInputChange}
                  style={{ width: '100%', padding: '12px 12px 12px 40px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white' }}
                />
              </div>

              {/* Destination Unit Dropdown */}
              <div style={{ position: 'relative' }}>
                <Home size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <select 
                  name="unidadeId" 
                  value={formData.unidadeId} 
                  onChange={handleInputChange}
                  style={{ width: '100%', padding: '12px 12px 12px 40px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white' }}
                  required
                >
                  <option value="" style={{ background: '#0f172a' }}>Selecione a Unidade de Destino</option>
                  {unidades.map((unidade) => (
                    <option key={unidade.id} value={unidade.id} style={{ background: '#0f172a' }}>
                      Unidade {unidade.numero} ({unidade.bloco?.nome || 'Sem Bloco'})
                    </option>
                  ))}
                </select>
              </div>

              <button type="submit" className="btn-primary" style={{ marginTop: '8px', padding: '12px' }}>
                Confirmar Entrada
              </button>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
