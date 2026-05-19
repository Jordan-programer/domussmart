import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { Plus, Edit, Trash2, X, User, CreditCard, Home, Clock, Check, Search } from 'lucide-react';
import axios from 'axios';

export default function Visitantes() {
  const [visitantes, setVisitantes] = useState([]);
  const [unidades, setUnidades] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    nome: '',
    nif: '',
    unidadeId: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    if (!token) {
      window.location.href = '/login';
      return;
    }
    fetchVisitantes();
    fetchUnidades();
  }, []);

  const fetchVisitantes = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/v1/visitantes', { headers });
      setVisitantes(response.data);
      setLoading(false);
    } catch (err) {
      setError('Erro ao carregar visitantes.');
      setLoading(false);
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

  const handleEdit = (visitante) => {
    setEditingItem(visitante);
    setFormData({
      nome: visitante.nome,
      nif: visitante.nif || '',
      unidadeId: visitante.unidade?.id || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        nome: formData.nome,
        nif: formData.nif,
        unidade: { id: parseInt(formData.unidadeId) },
        registradoPor: { id: parseInt(userId) } // Usuário logado que está registrando
      };

      if (editingItem) {
        payload.id = editingItem.id;
        payload.dataHoraEntrada = editingItem.dataHoraEntrada; // Mantém a data original
        payload.dataHoraSaida = editingItem.dataHoraSaida;
      } else {
        payload.dataHoraEntrada = new Date().toISOString(); // Nova entrada
      }

      await axios.post('http://localhost:8080/api/v1/visitantes', payload, { headers });
      
      setIsModalOpen(false);
      setEditingItem(null);
      setFormData({ nome: '', nif: '', unidadeId: '' });
      fetchVisitantes(); // Recarrega a lista
    } catch (err) {
      alert('Erro ao salvar visitante. Verifique os dados.');
    }
  };

  const handleRegistrarSaida = async (visitante) => {
    try {
      const payload = {
        ...visitante,
        dataHoraSaida: new Date().toISOString()
      };
      await axios.post('http://localhost:8080/api/v1/visitantes', payload, { headers });
      fetchVisitantes();
    } catch (err) {
      alert('Erro ao registrar saída.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Deseja realmente excluir este registro?')) {
      try {
        await axios.delete(`http://localhost:8080/api/v1/visitantes/${id}`, { headers });
        fetchVisitantes();
      } catch (err) {
        alert('Erro ao excluir visitante.');
      }
    }
  };

  const openNewModal = () => {
    setEditingItem(null);
    setFormData({ nome: '', nif: '', unidadeId: '' });
    setIsModalOpen(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  // Filtragem dos visitantes
  const filteredVisitantes = visitantes.filter((visitante) => {
    const search = searchTerm.toLowerCase();
    return (
      visitante.nome.toLowerCase().includes(search) ||
      (visitante.nif && visitante.nif.toLowerCase().includes(search)) ||
      (visitante.unidade?.numero && visitante.unidade.numero.toLowerCase().includes(search))
    );
  });

  return (
    <Layout>
      <div className="glass" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: 'white' }}>Controle de Visitantes</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Registro de entradas e saídas da portaria.</p>
          </div>
          
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            {/* Barra de Pesquisa */}
            <div style={{ position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                placeholder="Pesquisar por nome ou NIF..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ padding: '10px 12px 10px 40px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white', width: '250px' }}
              />
            </div>

            <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={openNewModal}>
              <Plus size={18} />
              Registrar Entrada
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
                  <th style={{ padding: '12px', color: 'var(--text-muted)' }}>Nome</th>
                  <th style={{ padding: '12px', color: 'var(--text-muted)' }}>NIF</th>
                  <th style={{ padding: '12px', color: 'var(--text-muted)' }}>Unidade</th>
                  <th style={{ padding: '12px', color: 'var(--text-muted)' }}>Entrada</th>
                  <th style={{ padding: '12px', color: 'var(--text-muted)' }}>Saída</th>
                  <th style={{ padding: '12px', color: 'var(--text-muted)', textAlign: 'center' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredVisitantes.map((visitante) => (
                  <tr key={visitante.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '12px' }}>{visitante.nome}</td>
                    <td style={{ padding: '12px' }}>{visitante.nif || '-'}</td>
                    <td style={{ padding: '12px' }}>{visitante.unidade?.numero || 'N/A'}</td>
                    <td style={{ padding: '12px' }}>{formatDate(visitante.dataHoraEntrada)}</td>
                    <td style={{ padding: '12px' }}>{formatDate(visitante.dataHoraSaida)}</td>
                    <td style={{ padding: '12px', display: 'flex', justifyContent: 'center', gap: '12px' }}>
                      {!visitante.dataHoraSaida && (
                        <button 
                          onClick={() => handleRegistrarSaida(visitante)}
                          style={{ background: 'rgba(34, 197, 94, 0.2)', color: '#4ade80', border: 'none', padding: '4px 8px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                          title="Registrar Saída"
                        >
                          <Check size={14} />
                          Saída
                        </button>
                      )}
                      <button onClick={() => handleEdit(visitante)} style={{ background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer' }}>
                        <Edit size={16} />
                      </button>
                      <button onClick={() => handleDelete(visitante.id)} style={{ background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer' }}>
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredVisitantes.length === 0 && (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>Nenhum visitante encontrado.</td>
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
              {editingItem ? 'Editar Registro' : 'Registrar Novo Visitante'}
            </h3>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Nome */}
              <div style={{ position: 'relative' }}>
                <User size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="text" name="nome" placeholder="Nome do Visitante" value={formData.nome} onChange={handleInputChange}
                  style={{ width: '100%', padding: '12px 12px 12px 40px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white' }}
                  required
                />
              </div>

              {/* NIF */}
              <div style={{ position: 'relative' }}>
                <CreditCard size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="text" name="nif" placeholder="NIF (Opcional)" value={formData.nif} onChange={handleInputChange}
                  style={{ width: '100%', padding: '12px 12px 12px 40px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white' }}
                />
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
                  {unidades.length === 0 && (
                    <option value="" style={{ background: '#0f172a' }}>Nenhuma unidade cadastrada</option>
                  )}
                </select>
              </div>

              <button type="submit" className="btn-primary" style={{ marginTop: '8px' }}>
                {editingItem ? 'Salvar Alterações' : 'Registrar Entrada'}
              </button>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
