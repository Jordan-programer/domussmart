import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { Plus, Edit, Trash2, X, Box, Search } from 'lucide-react';
import axios from 'axios';

export default function Blocos() {
  const [blocos, setBlocos] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    nome: ''
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
    fetchBlocos();
  }, []);

  const fetchBlocos = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/v1/blocos', { headers });
      setBlocos(response.data);
      setLoading(false);
    } catch (err) {
      setError('Erro ao carregar blocos.');
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleEdit = (bloco) => {
    setEditingItem(bloco);
    setFormData({
      nome: bloco.nome
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        nome: formData.nome
      };

      if (editingItem) {
        payload.id = editingItem.id;
      }

      await axios.post('http://localhost:8080/api/v1/blocos', payload, { headers });
      
      setIsModalOpen(false);
      setEditingItem(null);
      setFormData({ nome: '' });
      fetchBlocos(); // Recarrega a lista
    } catch (err) {
      alert('Erro ao salvar bloco. Verifique os dados.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Deseja realmente excluir este bloco?')) {
      try {
        await axios.delete(`http://localhost:8080/api/v1/blocos/${id}`, { headers });
        fetchBlocos();
      } catch (err) {
        alert('Erro ao excluir bloco.');
      }
    }
  };

  const openNewModal = () => {
    setEditingItem(null);
    setFormData({ nome: '' });
    setIsModalOpen(true);
  };

  // Filtragem dos blocos
  const filteredBlocos = blocos.filter((bloco) => {
    const search = searchTerm.toLowerCase();
    return bloco.nome.toLowerCase().includes(search);
  });

  return (
    <Layout>
      <div className="glass" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: 'white' }}>Gestão de Blocos</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Lista de blocos do condomínio.</p>
          </div>
          
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            {/* Barra de Pesquisa */}
            <div style={{ position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                placeholder="Pesquisar por nome..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ padding: '10px 12px 10px 40px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white', width: '250px' }}
              />
            </div>

            <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={openNewModal}>
              <Plus size={18} />
              Novo Bloco
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
                  <th style={{ padding: '12px', color: 'var(--text-muted)' }}>Nome do Bloco</th>
                  <th style={{ padding: '12px', color: 'var(--text-muted)', textAlign: 'center' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredBlocos.map((bloco) => (
                  <tr key={bloco.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '12px' }}>{bloco.nome}</td>
                    <td style={{ padding: '12px', display: 'flex', justifyContent: 'center', gap: '12px' }}>
                      <button onClick={() => handleEdit(bloco)} style={{ background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer' }}>
                        <Edit size={16} />
                      </button>
                      <button onClick={() => handleDelete(bloco.id)} style={{ background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer' }}>
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredBlocos.length === 0 && (
                  <tr>
                    <td colSpan="2" style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>Nenhum bloco encontrado.</td>
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
              {editingItem ? 'Editar Bloco' : 'Cadastrar Novo Bloco'}
            </h3>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Nome */}
              <div style={{ position: 'relative' }}>
                <Box size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="text" name="nome" placeholder="Nome do Bloco (Ex: Bloco A)" value={formData.nome} onChange={handleInputChange}
                  style={{ width: '100%', padding: '12px 12px 12px 40px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white' }}
                  required
                />
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
