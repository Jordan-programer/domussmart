import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { Plus, Edit, Trash2, X, Wrench, User, Home, Clock, Check, Play, Search } from 'lucide-react';
import axios from 'axios';

export default function Chamados() {
  const [chamados, setChamados] = useState([]);
  const [moradores, setMoradores] = useState([]);
  const [unidades, setUnidades] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    moradorId: '',
    unidadeId: '',
    descricao: '',
    status: 'ABERTO'
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
    fetchChamados();
    fetchMoradores();
    fetchUnidades();
  }, []);

  const fetchChamados = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/v1/chamados', { headers });
      setChamados(response.data);
      setLoading(false);
    } catch (err) {
      setError('Erro ao carregar chamados.');
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

  const fetchUnidades = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/v1/unidades', { headers });
      setUnidades(response.data);
    } catch (err) {
      console.error('Erro ao carregar unidades:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleEdit = (chamado) => {
    setEditingItem(chamado);
    setFormData({
      moradorId: chamado.morador?.id || '',
      unidadeId: chamado.unidade?.id || '',
      descricao: chamado.descricao,
      status: chamado.status
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        descricao: formData.descricao,
        morador: { id: parseInt(formData.moradorId) },
        unidade: { id: parseInt(formData.unidadeId) },
        status: formData.status
      };

      if (editingItem) {
        payload.id = editingItem.id;
        payload.dataAbertura = editingItem.dataAbertura;
      }

      await axios.post('http://localhost:8080/api/v1/chamados', payload, { headers });
      
      setIsModalOpen(false);
      setEditingItem(null);
      setFormData({ moradorId: '', unidadeId: '', descricao: '', status: 'ABERTO' });
      fetchChamados(); // Recarrega a lista
    } catch (err) {
      alert('Erro ao salvar chamado. Verifique os dados.');
    }
  };

  const handleStatusChange = async (chamado, newStatus) => {
    try {
      const payload = {
        ...chamado,
        status: newStatus
      };
      await axios.post('http://localhost:8080/api/v1/chamados', payload, { headers });
      fetchChamados();
    } catch (err) {
      alert('Erro ao atualizar status.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Deseja realmente excluir este chamado?')) {
      try {
        await axios.delete(`http://localhost:8080/api/v1/chamados/${id}`, { headers });
        fetchChamados();
      } catch (err) {
        alert('Erro ao excluir chamado.');
      }
    }
  };

  const openNewModal = () => {
    setEditingItem(null);
    setFormData({ moradorId: '', unidadeId: '', descricao: '', status: 'ABERTO' });
    setIsModalOpen(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'CONCLUIDO':
        return { background: 'rgba(34, 197, 94, 0.2)', color: '#4ade80' };
      case 'EM_ANDAMENTO':
        return { background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa' };
      default:
        return { background: 'rgba(234, 179, 8, 0.2)', color: '#facc15' };
    }
  };

  // Filtragem dos chamados
  const filteredChamados = chamados.filter((chamado) => {
    const search = searchTerm.toLowerCase();
    return (
      chamado.descricao.toLowerCase().includes(search) ||
      (chamado.morador?.nome && chamado.morador.nome.toLowerCase().includes(search)) ||
      (chamado.unidade?.numero && chamado.unidade.numero.toLowerCase().includes(search))
    );
  });

  return (
    <Layout>
      <div className="glass" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: 'white' }}>Chamados de Manutenção</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Gerencie as solicitações de reparos e suporte.</p>
          </div>
          
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            {/* Barra de Pesquisa */}
            <div style={{ position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                placeholder="Pesquisar por descrição ou morador..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ padding: '10px 12px 10px 40px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white', width: '250px' }}
              />
            </div>

            <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={openNewModal}>
              <Plus size={18} />
              Abrir Chamado
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
                  <th style={{ padding: '12px', color: 'var(--text-muted)' }}>Data</th>
                  <th style={{ padding: '12px', color: 'var(--text-muted)' }}>Morador</th>
                  <th style={{ padding: '12px', color: 'var(--text-muted)' }}>Unidade</th>
                  <th style={{ padding: '12px', color: 'var(--text-muted)' }}>Descrição</th>
                  <th style={{ padding: '12px', color: 'var(--text-muted)' }}>Status</th>
                  <th style={{ padding: '12px', color: 'var(--text-muted)', textAlign: 'center' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredChamados.map((chamado) => (
                  <tr key={chamado.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '12px' }}>{formatDate(chamado.dataAbertura)}</td>
                    <td style={{ padding: '12px' }}>{chamado.morador?.nome || 'N/A'}</td>
                    <td style={{ padding: '12px' }}>{chamado.unidade?.numero || 'N/A'}</td>
                    <td style={{ padding: '12px', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{chamado.descricao}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ 
                        padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '600',
                        ...getStatusStyle(chamado.status)
                      }}>
                        {chamado.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px', display: 'flex', justifyContent: 'center', gap: '8px' }}>
                      {chamado.status === 'ABERTO' && (
                        <button 
                          onClick={() => handleStatusChange(chamado, 'EM_ANDAMENTO')}
                          style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', border: 'none', padding: '4px 8px', borderRadius: '6px', cursor: 'pointer' }}
                          title="Iniciar Atendimento"
                        >
                          <Play size={14} />
                        </button>
                      )}
                      {chamado.status === 'EM_ANDAMENTO' && (
                        <button 
                          onClick={() => handleStatusChange(chamado, 'CONCLUIDO')}
                          style={{ background: 'rgba(34, 197, 94, 0.2)', color: '#4ade80', border: 'none', padding: '4px 8px', borderRadius: '6px', cursor: 'pointer' }}
                          title="Concluir Chamado"
                        >
                          <Check size={14} />
                        </button>
                      )}
                      <button onClick={() => handleEdit(chamado)} style={{ background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer' }}>
                        <Edit size={16} />
                      </button>
                      <button onClick={() => handleDelete(chamado.id)} style={{ background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer' }}>
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredChamados.length === 0 && (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>Nenhum chamado encontrado.</td>
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
              {editingItem ? 'Editar Chamado' : 'Abrir Novo Chamado'}
            </h3>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Morador (Dropdown) */}
              <div style={{ position: 'relative' }}>
                <User size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <select 
                  name="moradorId" value={formData.moradorId} onChange={handleInputChange}
                  style={{ width: '100%', padding: '12px 12px 12px 40px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white' }}
                  required
                >
                  <option value="" style={{ background: '#0f172a' }}>Selecione o Morador</option>
                  {moradores.map((morador) => (
                    <option key={morador.id} value={morador.id} style={{ background: '#0f172a' }}>
                      {morador.nome}
                    </option>
                  ))}
                </select>
              </div>

              {/* Unidade (Dropdown) */}
              <div style={{ position: 'relative' }}>
                <Home size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <select 
                  name="unidadeId" value={formData.unidadeId} onChange={handleInputChange}
                  style={{ width: '100%', padding: '12px 12px 12px 40px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white' }}
                  required
                >
                  <option value="" style={{ background: '#0f172a' }}>Selecione a Unidade</option>
                  {unidades.map((unidade) => (
                    <option key={unidade.id} value={unidade.id} style={{ background: '#0f172a' }}>
                      Unidade {unidade.numero} ({unidade.bloco?.nome || 'Sem Bloco'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Descrição */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Descrição do Problema</label>
                <textarea 
                  name="descricao" placeholder="Descreva o problema ou solicitação..." value={formData.descricao} onChange={handleInputChange}
                  style={{ width: '100%', minHeight: '120px', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white', resize: 'vertical' }}
                  required
                />
              </div>

              {/* Status (Apenas se estiver editando) */}
              {editingItem && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Status</label>
                  <select 
                    name="status" value={formData.status} onChange={handleInputChange}
                    style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white' }}
                  >
                    <option value="ABERTO" style={{ background: '#0f172a' }}>Aberto</option>
                    <option value="EM_ANDAMENTO" style={{ background: '#0f172a' }}>Em Andamento</option>
                    <option value="CONCLUIDO" style={{ background: '#0f172a' }}>Concluído</option>
                  </select>
                </div>
              )}

              <button type="submit" className="btn-primary" style={{ marginTop: '8px' }}>
                {editingItem ? 'Salvar Alterações' : 'Abrir Chamado'}
              </button>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
