import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { Plus, Edit, Trash2, X, User, Phone, Mail, CreditCard, Home, Search } from 'lucide-react';
import axios from 'axios';

export default function Moradores() {
  const [moradores, setMoradores] = useState([]);
  const [unidades, setUnidades] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    nome: '',
    nif: '',
    telefone: '',
    email: '',
    tipo: 'PROPRIETARIO',
    unidadeId: ''
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
    fetchMoradores();
    fetchUnidades();
  }, []);

  const fetchMoradores = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/v1/moradores', { headers });
      setMoradores(response.data);
      setLoading(false);
    } catch (err) {
      setError('Erro ao carregar moradores. Verifique sua autenticação.');
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

  const handleEdit = (morador) => {
    setEditingItem(morador);
    setFormData({
      nome: morador.nome,
      nif: morador.nif || '',
      telefone: morador.telefone || '',
      email: morador.email || '',
      tipo: morador.tipo,
      unidadeId: morador.unidade?.id || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        nome: formData.nome,
        nif: formData.nif,
        telefone: formData.telefone,
        email: formData.email,
        tipo: formData.tipo,
        unidade: formData.unidadeId ? { id: parseInt(formData.unidadeId) } : null
      };

      if (editingItem) {
        payload.id = editingItem.id;
      }

      await axios.post('http://localhost:8080/api/v1/moradores', payload, { headers });
      
      setIsModalOpen(false);
      setEditingItem(null);
      setFormData({ nome: '', nif: '', telefone: '', email: '', tipo: 'PROPRIETARIO', unidadeId: '' });
      fetchMoradores(); // Recarrega a lista
    } catch (err) {
      alert('Erro ao salvar morador. Verifique os dados.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Deseja realmente excluir este morador?')) {
      try {
        await axios.delete(`http://localhost:8080/api/v1/moradores/${id}`, { headers });
        fetchMoradores();
      } catch (err) {
        alert('Erro ao excluir morador.');
      }
    }
  };

  const openNewModal = () => {
    setEditingItem(null);
    setFormData({ nome: '', nif: '', telefone: '', email: '', tipo: 'PROPRIETARIO', unidadeId: '' });
    setIsModalOpen(true);
  };

  // Filtragem dos moradores
  const filteredMoradores = moradores.filter((morador) => {
    const search = searchTerm.toLowerCase();
    return (
      morador.nome.toLowerCase().includes(search) ||
      (morador.nif && morador.nif.toLowerCase().includes(search)) ||
      (morador.email && morador.email.toLowerCase().includes(search))
    );
  });

  return (
    <Layout>
      <div className="glass" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: 'white' }}>Gestão de Moradores</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Lista de pessoas que vivem no condomínio.</p>
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

            {localStorage.getItem('role') !== 'PORTEIRO' && (
              <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={openNewModal}>
                <Plus size={18} />
                Novo Morador
              </button>
            )}
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
                  <th style={{ padding: '12px', color: 'var(--text-muted)' }}>Telefone</th>
                  <th style={{ padding: '12px', color: 'var(--text-muted)' }}>E-mail</th>
                  <th style={{ padding: '12px', color: 'var(--text-muted)' }}>Unidade</th>
                  <th style={{ padding: '12px', color: 'var(--text-muted)' }}>Tipo</th>
                  {localStorage.getItem('role') !== 'PORTEIRO' && (
                    <th style={{ padding: '12px', color: 'var(--text-muted)', textAlign: 'center' }}>Ações</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {filteredMoradores.map((morador) => (
                  <tr key={morador.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '12px' }}>{morador.nome}</td>
                    <td style={{ padding: '12px' }}>{morador.nif || '-'}</td>
                    <td style={{ padding: '12px' }}>{morador.telefone || '-'}</td>
                    <td style={{ padding: '12px' }}>{morador.email || '-'}</td>
                    <td style={{ padding: '12px' }}>{morador.unidade?.numero || 'N/A'}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ 
                        padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '600',
                        background: morador.tipo === 'PROPRIETARIO' ? 'rgba(99, 102, 241, 0.2)' : 'rgba(236, 72, 153, 0.2)',
                        color: morador.tipo === 'PROPRIETARIO' ? '#a5b4fc' : '#fbcfe8'
                      }}>
                        {morador.tipo}
                      </span>
                    </td>
                    {localStorage.getItem('role') !== 'PORTEIRO' && (
                      <td style={{ padding: '12px', display: 'flex', justifyContent: 'center', gap: '12px' }}>
                        <button onClick={() => handleEdit(morador)} style={{ background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer' }}>
                          <Edit size={16} />
                        </button>
                        <button onClick={() => handleDelete(morador.id)} style={{ background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer' }}>
                          <Trash2 size={16} />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
                {filteredMoradores.length === 0 && (
                  <tr>
                    <td colSpan={localStorage.getItem('role') === 'PORTEIRO' ? 6 : 7} style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>Nenhum morador encontrado.</td>
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
              {editingItem ? 'Editar Morador' : 'Cadastrar Novo Morador'}
            </h3>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Nome */}
              <div style={{ position: 'relative' }}>
                <User size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="text" name="nome" placeholder="Nome Completo" value={formData.nome} onChange={handleInputChange}
                  style={{ width: '100%', padding: '12px 12px 12px 40px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white' }}
                  required
                />
              </div>

              {/* NIF */}
              <div style={{ position: 'relative' }}>
                <CreditCard size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="text" name="nif" placeholder="NIF" value={formData.nif} onChange={handleInputChange}
                  style={{ width: '100%', padding: '12px 12px 12px 40px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white' }}
                  required
                />
              </div>

              {/* Telefone */}
              <div style={{ position: 'relative' }}>
                <Phone size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="text" name="telefone" placeholder="Telefone" value={formData.telefone} onChange={handleInputChange}
                  style={{ width: '100%', padding: '12px 12px 12px 40px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white' }}
                />
              </div>

              {/* Email */}
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="email" name="email" placeholder="E-mail" value={formData.email} onChange={handleInputChange}
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
                </select>
              </div>

              {/* Tipo */}
              <div style={{ display: 'flex', gap: '12px' }}>
                <label style={{ flex: 1 }}>
                  <input type="radio" name="tipo" value="PROPRIETARIO" checked={formData.tipo === 'PROPRIETARIO'} onChange={handleInputChange} style={{ display: 'none' }} />
                  <div style={{ 
                    padding: '12px', textAlign: 'center', borderRadius: '12px', cursor: 'pointer',
                    background: formData.tipo === 'PROPRIETARIO' ? 'var(--gradient-primary)' : 'rgba(255,255,255,0.05)',
                    color: formData.tipo === 'PROPRIETARIO' ? 'white' : 'var(--text-muted)',
                    border: '1px solid rgba(255,255,255,0.1)', transition: 'all 0.3s'
                  }}>
                    Proprietário
                  </div>
                </label>
                <label style={{ flex: 1 }}>
                  <input type="radio" name="tipo" value="INQUILINO" checked={formData.tipo === 'INQUILINO'} onChange={handleInputChange} style={{ display: 'none' }} />
                  <div style={{ 
                    padding: '12px', textAlign: 'center', borderRadius: '12px', cursor: 'pointer',
                    background: formData.tipo === 'INQUILINO' ? 'var(--gradient-primary)' : 'rgba(255,255,255,0.05)',
                    color: formData.tipo === 'INQUILINO' ? 'white' : 'var(--text-muted)',
                    border: '1px solid rgba(255,255,255,0.1)', transition: 'all 0.3s'
                  }}>
                    Inquilino
                  </div>
                </label>
              </div>

              <button type="submit" className="btn-primary" style={{ marginTop: '8px' }}>
                {editingItem ? 'Salvar Alterações' : 'Cadastrar'}
              </button>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
