import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { Plus, Edit, Trash2, X, Home, Building, CreditCard, Search } from 'lucide-react';
import axios from 'axios';

export default function Unidades() {
  const [unidades, setUnidades] = useState([]);
  const [blocos, setBlocos] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    numero: '',
    blocoId: '',
    vagas: ''
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
    fetchUnidades();
    fetchBlocos();
  }, []);

  const fetchUnidades = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/v1/unidades', { headers });
      setUnidades(response.data);
      setLoading(false);
    } catch (err) {
      setError('Erro ao carregar unidades.');
      setLoading(false);
    }
  };

  const fetchBlocos = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/v1/blocos', { headers });
      setBlocos(response.data);
    } catch (err) {
      console.error('Erro ao carregar blocos:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleEdit = (unidade) => {
    setEditingItem(unidade);
    setFormData({
      numero: unidade.numero,
      blocoId: unidade.bloco?.id || '',
      vagas: unidade.vagas || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        numero: formData.numero,
        vagas: formData.vagas ? parseInt(formData.vagas) : 0,
        bloco: { id: parseInt(formData.blocoId) }
      };

      if (editingItem) {
        payload.id = editingItem.id;
      }

      await axios.post('http://localhost:8080/api/v1/unidades', payload, { headers });
      
      setIsModalOpen(false);
      setEditingItem(null);
      setFormData({ numero: '', blocoId: '', vagas: '' });
      fetchUnidades(); // Recarrega a lista
    } catch (err) {
      alert('Erro ao salvar unidade. Verifique os dados.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Deseja realmente excluir esta unidade?')) {
      try {
        await axios.delete(`http://localhost:8080/api/v1/unidades/${id}`, { headers });
        fetchUnidades();
      } catch (err) {
        alert('Erro ao excluir unidade.');
      }
    }
  };

  const openNewModal = () => {
    setEditingItem(null);
    setFormData({ numero: '', blocoId: '', vagas: '' });
    setIsModalOpen(true);
  };

  // Filtragem das unidades
  const filteredUnidades = unidades.filter((unidade) => {
    const search = searchTerm.toLowerCase();
    return (
      unidade.numero.toLowerCase().includes(search) ||
      (unidade.bloco?.nome && unidade.bloco.nome.toLowerCase().includes(search))
    );
  });

  return (
    <Layout>
      <div className="glass" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: 'white' }}>Gestão de Unidades</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Lista de apartamentos/casas do condomínio.</p>
          </div>
          
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            {/* Barra de Pesquisa */}
            <div style={{ position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                placeholder="Pesquisar por número ou bloco..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ padding: '10px 12px 10px 40px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white', width: '250px' }}
              />
            </div>

            <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={openNewModal}>
              <Plus size={18} />
              Nova Unidade
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
                  <th style={{ padding: '12px', color: 'var(--text-muted)' }}>Número</th>
                  <th style={{ padding: '12px', color: 'var(--text-muted)' }}>Bloco</th>
                  <th style={{ padding: '12px', color: 'var(--text-muted)' }}>Vagas</th>
                  <th style={{ padding: '12px', color: 'var(--text-muted)', textAlign: 'center' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredUnidades.map((unidade) => (
                  <tr key={unidade.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '12px' }}>{unidade.numero}</td>
                    <td style={{ padding: '12px' }}>{unidade.bloco?.nome || 'N/A'}</td>
                    <td style={{ padding: '12px' }}>{unidade.vagas || 0}</td>
                    <td style={{ padding: '12px', display: 'flex', justifyContent: 'center', gap: '12px' }}>
                      <button onClick={() => handleEdit(unidade)} style={{ background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer' }}>
                        <Edit size={16} />
                      </button>
                      <button onClick={() => handleDelete(unidade.id)} style={{ background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer' }}>
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredUnidades.length === 0 && (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>Nenhuma unidade encontrada.</td>
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
              {editingItem ? 'Editar Unidade' : 'Cadastrar Nova Unidade'}
            </h3>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Número */}
              <div style={{ position: 'relative' }}>
                <Home size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="text" name="numero" placeholder="Número da Unidade (Ex: 101)" value={formData.numero} onChange={handleInputChange}
                  style={{ width: '100%', padding: '12px 12px 12px 40px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white' }}
                  required
                />
              </div>

              {/* Vagas */}
              <div style={{ position: 'relative' }}>
                <CreditCard size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="number" name="vagas" placeholder="Quantidade de Vagas" value={formData.vagas} onChange={handleInputChange}
                  style={{ width: '100%', padding: '12px 12px 12px 40px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white' }}
                />
              </div>

              {/* Bloco (Dropdown) */}
              <div style={{ position: 'relative' }}>
                <Building size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <select 
                  name="blocoId" value={formData.blocoId} onChange={handleInputChange}
                  style={{ width: '100%', padding: '12px 12px 12px 40px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white' }}
                  required
                >
                  <option value="" style={{ background: '#0f172a' }}>Selecione o Bloco</option>
                  {Array.isArray(blocos) && blocos.map((bloco) => (
                    <option key={bloco.id} value={bloco.id} style={{ background: '#0f172a' }}>
                      {bloco.nome}
                    </option>
                  ))}
                </select>
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
