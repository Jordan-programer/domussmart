import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { Plus, Edit, Trash2, X, Calendar, MapPin, User, Clock, Check, Ban, Search } from 'lucide-react';
import axios from 'axios';

export default function Reservas() {
  const [reservas, setReservas] = useState([]);
  const [moradores, setMoradores] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    area: '',
    moradorId: '',
    dataHoraInicio: '',
    dataHoraFim: '',
    status: 'PENDENTE'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    if (!token) {
      window.location.href = '/login';
      return;
    }
    fetchReservas();
    fetchMoradores();
    if (localStorage.getItem('role') === 'MORADOR') {
      fetchCurrentUser();
    }
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/v1/usuarios/me', { headers });
      setCurrentUser(response.data);
      if (response.data.moradorId) {
        localStorage.setItem('moradorId', response.data.moradorId);
      }
      if (response.data.unidadeId) {
        localStorage.setItem('unidadeId', response.data.unidadeId);
      }
    } catch (err) {
      console.error('Erro ao carregar dados do usuário:', err);
    }
  };

  const fetchReservas = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/v1/reservas', { headers });
      setReservas(response.data);
      setLoading(false);
    } catch (err) {
      setError('Erro ao carregar reservas.');
      setLoading(false);
    }
  };

  const fetchMoradores = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/v1/moradores', { headers });
      setMoradores(response.data);
    } catch (err) {
      console.error('Erro ao carregar moradores:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleEdit = (reserva) => {
    setEditingItem(reserva);
    setFormData({
      area: reserva.area,
      moradorId: reserva.morador?.id || '',
      dataHoraInicio: reserva.dataHoraInicio ? reserva.dataHoraInicio.substring(0, 16) : '',
      dataHoraFim: reserva.dataHoraFim ? reserva.dataHoraFim.substring(0, 16) : '',
      status: reserva.status
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const activeMoradorId = localStorage.getItem('role') === 'MORADOR' 
        ? (currentUser?.moradorId || localStorage.getItem('moradorId'))
        : formData.moradorId;

      if (!activeMoradorId) {
        alert('Erro: Morador não identificado. Certifique-se de que sua conta está vinculada a um perfil de morador.');
        return;
      }

      const payload = {
        area: formData.area,
        morador: { id: parseInt(activeMoradorId) },
        dataHoraInicio: new Date(formData.dataHoraInicio).toISOString(),
        dataHoraFim: new Date(formData.dataHoraFim).toISOString(),
        status: localStorage.getItem('role') === 'MORADOR' ? 'PENDENTE' : formData.status
      };

      if (editingItem) {
        payload.id = editingItem.id;
      }

      await axios.post('http://localhost:8080/api/v1/reservas', payload, { headers });
      
      setIsModalOpen(false);
      setEditingItem(null);
      setFormData({ area: '', moradorId: '', dataHoraInicio: '', dataHoraFim: '', status: 'PENDENTE' });
      fetchReservas(); // Recarrega a lista
    } catch (err) {
      alert('Erro ao salvar reserva. Verifique os dados e horários.');
    }
  };

  const handleStatusChange = async (reserva, newStatus) => {
    try {
      const payload = {
        ...reserva,
        status: newStatus
      };
      await axios.post('http://localhost:8080/api/v1/reservas', payload, { headers });
      fetchReservas();
    } catch (err) {
      alert('Erro ao atualizar status.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Deseja realmente excluir esta reserva?')) {
      try {
        await axios.delete(`http://localhost:8080/api/v1/reservas/${id}`, { headers });
        fetchReservas();
      } catch (err) {
        alert('Erro ao excluir reserva.');
      }
    }
  };

  const openNewModal = () => {
    setEditingItem(null);
    setFormData({ 
      area: '', 
      moradorId: localStorage.getItem('role') === 'MORADOR' ? (currentUser?.moradorId || localStorage.getItem('moradorId') || '') : '', 
      dataHoraInicio: '', 
      dataHoraFim: '', 
      status: 'PENDENTE' 
    });
    setIsModalOpen(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'CONFIRMADA':
        return { background: 'rgba(34, 197, 94, 0.2)', color: '#4ade80' };
      case 'CANCELADA':
        return { background: 'rgba(239, 68, 68, 0.2)', color: '#f87171' };
      default:
        return { background: 'rgba(234, 179, 8, 0.2)', color: '#facc15' };
    }
  };

  // Filtragem das reservas
  const filteredReservas = reservas.filter((reserva) => {
    const search = searchTerm.toLowerCase();
    return (
      reserva.area.toLowerCase().includes(search) ||
      (reserva.morador?.nome && reserva.morador.nome.toLowerCase().includes(search))
    );
  });

  return (
    <Layout>
      <div className="glass" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: 'white' }}>Reservas de Áreas Comuns</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Gerencie o uso dos espaços do condomínio.</p>
          </div>
          
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            {/* Barra de Pesquisa */}
            <div style={{ position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                placeholder="Pesquisar por área ou morador..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ padding: '10px 12px 10px 40px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white', width: '250px' }}
              />
            </div>

            <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={openNewModal}>
              <Plus size={18} />
              Nova Reserva
            </button>
          </div>
        </div>

        {loading ? (
          <div style={{ color: 'white', textAlign: 'center', padding: '20px' }}>Carregando...</div>
        ) : error ? (
          <div style={{ color: '#ef4444', textAlign: 'center', padding: '20px' }}>{error}</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', color: 'white' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'left' }}>
                  <th style={{ padding: '12px', color: 'var(--text-muted)' }}>Área</th>
                  <th style={{ padding: '12px', color: 'var(--text-muted)' }}>Morador</th>
                  <th style={{ padding: '12px', color: 'var(--text-muted)' }}>Início</th>
                  <th style={{ padding: '12px', color: 'var(--text-muted)' }}>Fim</th>
                  <th style={{ padding: '12px', color: 'var(--text-muted)' }}>Status</th>
                  <th style={{ padding: '12px', color: 'var(--text-muted)', textAlign: 'center' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredReservas.map((reserva) => (
                  <tr key={reserva.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '12px' }}>{reserva.area}</td>
                    <td style={{ padding: '12px' }}>{reserva.morador?.nome || 'N/A'}</td>
                    <td style={{ padding: '12px' }}>{formatDate(reserva.dataHoraInicio)}</td>
                    <td style={{ padding: '12px' }}>{formatDate(reserva.dataHoraFim)}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ 
                        padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '600',
                        ...getStatusStyle(reserva.status)
                      }}>
                        {reserva.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px', display: 'flex', justifyContent: 'center', gap: '8px' }}>
                      {reserva.status === 'PENDENTE' && (
                        <>
                          {localStorage.getItem('role') !== 'MORADOR' && (
                            <button 
                              onClick={() => handleStatusChange(reserva, 'CONFIRMADA')}
                              style={{ background: 'rgba(34, 197, 94, 0.2)', color: '#4ade80', border: 'none', padding: '4px 8px', borderRadius: '6px', cursor: 'pointer' }}
                              title="Confirmar"
                            >
                              <Check size={14} />
                            </button>
                          )}
                          <button 
                            onClick={() => handleStatusChange(reserva, 'CANCELADA')}
                            style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#f87171', border: 'none', padding: '4px 8px', borderRadius: '6px', cursor: 'pointer' }}
                            title="Cancelar"
                          >
                            <Ban size={14} />
                          </button>
                        </>
                      )}
                      <button onClick={() => handleEdit(reserva)} style={{ background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer' }}>
                        <Edit size={16} />
                      </button>
                      <button onClick={() => handleDelete(reserva.id)} style={{ background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer' }}>
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredReservas.length === 0 && (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>Nenhuma reserva encontrada.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div style={{ 
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', 
          background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', 
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 
        }}>
          <div className="glass" style={{ width: '100%', maxWidth: '500px', padding: '32px', position: 'relative' }}>
            <button 
              onClick={() => setIsModalOpen(false)}
              style={{ position: 'absolute', top: '20px', right: '20px', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>

            <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '24px', color: 'white' }}>
              {editingItem ? 'Editar Reserva' : 'Nova Reserva'}
            </h3>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Área */}
              <div style={{ position: 'relative' }}>
                <MapPin size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="text" name="area" placeholder="Ex: Salão de Festas, Churrasqueira" value={formData.area} onChange={handleInputChange}
                  style={{ width: '100%', padding: '12px 12px 12px 40px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white' }}
                  required
                />
              </div>

              {/* Morador (Dropdown ou bloqueado se for Morador logado) */}
              <div style={{ position: 'relative' }}>
                <User size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                {localStorage.getItem('role') === 'MORADOR' ? (
                  <input 
                    type="text" 
                    value={currentUser?.nome || 'Carregando perfil...'} 
                    disabled 
                    style={{ width: '100%', padding: '12px 12px 12px 40px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', color: 'var(--text-muted)', cursor: 'not-allowed' }}
                  />
                ) : (
                  <select 
                    name="moradorId" value={formData.moradorId} onChange={handleInputChange}
                    style={{ width: '100%', padding: '12px 12px 12px 40px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white' }}
                    required
                  >
                    <option value="" style={{ background: '#0f172a' }}>Selecione o Morador</option>
                    {moradores.map((morador) => (
                      <option key={morador.id} value={morador.id} style={{ background: '#0f172a' }}>
                        {morador.nome} (Unidade {morador.unidade?.numero || 'N/A'})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Data Início */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Data/Hora de Início</label>
                <div style={{ position: 'relative' }}>
                  <Clock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input 
                    type="datetime-local" name="dataHoraInicio" value={formData.dataHoraInicio} onChange={handleInputChange}
                    style={{ width: '100%', padding: '12px 12px 12px 40px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white' }}
                    required
                  />
                </div>
              </div>

              {/* Data Fim */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Data/Hora de Fim</label>
                <div style={{ position: 'relative' }}>
                  <Clock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input 
                    type="datetime-local" name="dataHoraFim" value={formData.dataHoraFim} onChange={handleInputChange}
                    style={{ width: '100%', padding: '12px 12px 12px 40px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white' }}
                    required
                  />
                </div>
              </div>

              {/* Status (Apenas se estiver editando e não for Morador) */}
              {editingItem && localStorage.getItem('role') !== 'MORADOR' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Status</label>
                  <select 
                    name="status" value={formData.status} onChange={handleInputChange}
                    style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white' }}
                  >
                    <option value="PENDENTE" style={{ background: '#0f172a' }}>Pendente</option>
                    <option value="CONFIRMADA" style={{ background: '#0f172a' }}>Confirmada</option>
                    <option value="CANCELADA" style={{ background: '#0f172a' }}>Cancelada</option>
                  </select>
                </div>
              )}

              <button type="submit" className="btn-primary" style={{ marginTop: '8px' }}>
                {editingItem ? 'Salvar Alterações' : 'Criar Reserva'}
              </button>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
