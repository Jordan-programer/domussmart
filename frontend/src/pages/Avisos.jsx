import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { Plus, Edit, Trash2, X, Bell, Pin, Megaphone, Search } from 'lucide-react';
import axios from 'axios';

export default function Avisos() {
  const [avisos, setAvisos] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    fixado: false
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
    fetchAvisos();
  }, []);

  const fetchAvisos = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/v1/avisos', { headers });
      setAvisos(response.data);
      setLoading(false);
    } catch (err) {
      setError('Erro ao carregar avisos.');
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ 
      ...formData, 
      [name]: type === 'checkbox' ? checked : value 
    });
  };

  const handleEdit = (aviso) => {
    setEditingItem(aviso);
    setFormData({
      titulo: aviso.titulo,
      descricao: aviso.descricao,
      fixado: aviso.fixado
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        titulo: formData.titulo,
        descricao: formData.descricao,
        fixado: formData.fixado
      };

      if (editingItem) {
        payload.id = editingItem.id;
        payload.dataCriacao = editingItem.dataCriacao;
      }

      await axios.post('http://localhost:8080/api/v1/avisos', payload, { headers });
      
      setIsModalOpen(false);
      setEditingItem(null);
      setFormData({ titulo: '', descricao: '', fixado: false });
      fetchAvisos(); // Recarrega a lista
    } catch (err) {
      alert('Erro ao salvar aviso. Verifique os dados.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Deseja realmente excluir este aviso?')) {
      try {
        await axios.delete(`http://localhost:8080/api/v1/avisos/${id}`, { headers });
        fetchAvisos();
      } catch (err) {
        alert('Erro ao excluir aviso.');
      }
    }
  };

  const openNewModal = () => {
    setEditingItem(null);
    setFormData({ titulo: '', descricao: '', fixado: false });
    setIsModalOpen(true);
  };

  // Ordenação: Fixados primeiro
  const sortedAvisos = [...avisos].sort((a, b) => {
    if (a.fixado && !b.fixado) return -1;
    if (!a.fixado && b.fixado) return 1;
    return new Date(b.dataCriacao) - new Date(a.dataCriacao); // Mais recentes primeiro
  });

  // Filtragem dos avisos
  const filteredAvisos = sortedAvisos.filter((aviso) => {
    const search = searchTerm.toLowerCase();
    return (
      aviso.titulo.toLowerCase().includes(search) ||
      aviso.descricao.toLowerCase().includes(search)
    );
  });

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (
    <Layout>
      <div style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.75rem', fontWeight: '600', color: 'white' }}>Mural de Avisos</h3>
            <p style={{ color: 'var(--text-muted)' }}>Comunique-se com todos os moradores.</p>
          </div>
          
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            {/* Barra de Pesquisa */}
            <div style={{ position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                placeholder="Pesquisar por título ou conteúdo..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ padding: '10px 12px 10px 40px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white', width: '250px' }}
              />
            </div>

            <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={openNewModal}>
              <Plus size={18} />
              Novo Aviso
            </button>
          </div>
        </div>

        {loading ? (
          <div style={{ color: 'white', textAlign: 'center', padding: '20px' }}>Carregando...</div>
        ) : error ? (
          <div style={{ color: '#ef4444', textAlign: 'center', padding: '20px' }}>{error}</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
            {filteredAvisos.map((aviso) => (
              <div key={aviso.id} className="glass" style={{ padding: '24px', position: 'relative', border: aviso.fixado ? '1px solid var(--secondary)' : '1px solid rgba(255,255,255,0.1)' }}>
                {aviso.fixado && (
                  <div style={{ position: 'absolute', top: '12px', right: '12px', color: 'var(--secondary)' }}>
                    <Pin size={16} />
                  </div>
                )}
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ padding: '8px', background: 'rgba(99, 102, 241, 0.2)', borderRadius: '8px', color: 'var(--primary)' }}>
                    <Megaphone size={20} />
                  </div>
                  <div>
                    <h4 style={{ color: 'white', fontWeight: '600' }}>{aviso.titulo}</h4>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{formatDate(aviso.dataCriacao)}</p>
                  </div>
                </div>

                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem', marginBottom: '20px', lineHeight: '1.5' }}>
                  {aviso.descricao}
                </p>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '12px' }}>
                  <button onClick={() => handleEdit(aviso)} style={{ background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer' }}>
                    <Edit size={16} />
                  </button>
                  <button onClick={() => handleDelete(aviso.id)} style={{ background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer' }}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
            {filteredAvisos.length === 0 && (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                Nenhum aviso encontrado.
              </div>
            )}
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
              {editingItem ? 'Editar Aviso' : 'Novo Aviso'}
            </h3>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Título */}
              <div>
                <input 
                  type="text" name="titulo" placeholder="Título do Aviso" value={formData.titulo} onChange={handleInputChange}
                  style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white' }}
                  required
                />
              </div>

              {/* Descrição */}
              <div>
                <textarea 
                  name="descricao" placeholder="Conteúdo do aviso..." value={formData.descricao} onChange={handleInputChange}
                  style={{ width: '100%', minHeight: '150px', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white', resize: 'vertical' }}
                  required
                />
              </div>

              {/* Fixar */}
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'white', cursor: 'pointer' }}>
                <input 
                  type="checkbox" name="fixado" checked={formData.fixado} onChange={handleInputChange}
                  style={{ width: '18px', height: '18px' }}
                />
                <span>Fixar no topo do mural</span>
              </label>

              <button type="submit" className="btn-primary" style={{ marginTop: '8px' }}>
                {editingItem ? 'Salvar Alterações' : 'Publicar Aviso'}
              </button>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
