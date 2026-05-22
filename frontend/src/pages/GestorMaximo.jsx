import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { Plus, Edit, Trash2, X, Building, User, Mail, Shield, Search } from 'lucide-react';
import axios from 'axios';

export default function GestorMaximo() {
  const [condominios, setCondominios] = useState([]);
  const [isCondoModalOpen, setIsCondoModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingCondo, setEditingCondo] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [condoFormData, setCondoFormData] = useState({
    nome: '',
    nif: '',
    endereco: ''
  });

  const [userFormData, setUserFormData] = useState({
    email: '',
    senha: '',
    role: 'SINDICO',
    condominioId: ''
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
    fetchCondominios();
  }, []);

  const fetchCondominios = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/v1/condominios', { headers });
      setCondominios(response.data);
      setLoading(false);
    } catch (err) {
      setError('Erro ao carregar condomínios.');
      setLoading(false);
    }
  };

  const handleCondoInputChange = (e) => {
    const { name, value } = e.target;
    setCondoFormData({ ...condoFormData, [name]: value });
  };

  const handleUserInputChange = (e) => {
    const { name, value } = e.target;
    setUserFormData({ ...userFormData, [name]: value });
  };

  const handleCondoSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        nome: condoFormData.nome,
        nif: condoFormData.nif,
        endereco: condoFormData.endereco
      };

      if (editingCondo) {
        payload.id = editingCondo.id;
      }

      await axios.post('http://localhost:8080/api/v1/condominios', payload, { headers });
      
      setIsCondoModalOpen(false);
      setEditingCondo(null);
      setCondoFormData({ nome: '', nif: '', endereco: '' });
      fetchCondominios();
    } catch (err) {
      alert('Erro ao salvar condomínio.');
    }
  };

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        email: userFormData.email,
        senha: userFormData.senha,
        role: userFormData.role,
        condominioId: parseInt(userFormData.condominioId)
      };

      await axios.post('http://localhost:8080/api/v1/auth/register', payload, { headers });
      
      setIsUserModalOpen(false);
      setUserFormData({ email: '', senha: '', role: 'SINDICO', condominioId: '' });
      alert('Usuário administrador criado com sucesso!');
    } catch (err) {
      alert('Erro ao criar usuário. Verifique se o e-mail já existe.');
    }
  };

  const handleDeleteCondo = async (id) => {
    if (window.confirm('Deseja realmente excluir este condomínio? Isso pode apagar dados vinculados!')) {
      try {
        await axios.delete(`http://localhost:8080/api/v1/condominios/${id}`, { headers });
        fetchCondominios();
      } catch (err) {
        alert('Erro ao excluir condomínio.');
      }
    }
  };

  const openEditCondo = (condo) => {
    setEditingCondo(condo);
    setCondoFormData({
      nome: condo.nome,
      nif: condo.nif || '',
      endereco: condo.endereco || ''
    });
    setIsCondoModalOpen(true);
  };

  const openCreateUser = (condoId) => {
    setUserFormData({ ...userFormData, condominioId: condoId });
    setIsUserModalOpen(true);
  };

  // Filtragem dos condomínios
  const filteredCondominios = condominios.filter((condo) => {
    const search = searchTerm.toLowerCase();
    return (
      condo.nome.toLowerCase().includes(search) ||
      (condo.nif && condo.nif.toLowerCase().includes(search))
    );
  });

  return (
    <Layout>
      <div style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.75rem', fontWeight: '600', color: 'white' }}>Painel do Gestor Máximo</h3>
            <p style={{ color: 'var(--text-muted)' }}>Gerenciamento global de condomínios e administradores.</p>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            {/* Barra de Pesquisa */}
            <div style={{ position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                placeholder="Pesquisar condomínio..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ padding: '10px 12px 10px 40px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white', width: '250px' }}
              />
            </div>

            <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => { setEditingCondo(null); setCondoFormData({ nome: '', nif: '', endereco: '' }); setIsCondoModalOpen(true); }}>
              <Plus size={18} />
              Novo Condomínio
            </button>
          </div>
        </div>

        {loading ? (
          <div style={{ color: 'white', textAlign: 'center', padding: '20px' }}>Carregando...</div>
        ) : error ? (
          <div style={{ color: '#ef4444', textAlign: 'center', padding: '20px' }}>{error}</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' }}>
            {filteredCondominios.map((condo) => (
              <div key={condo.id} className="glass" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                    <div style={{ padding: '10px', background: 'rgba(99, 102, 241, 0.2)', borderRadius: '10px', color: 'var(--primary)' }}>
                      <Building size={24} />
                    </div>
                    <div>
                      <h4 style={{ color: 'white', fontWeight: '600', fontSize: '1.1rem' }}>{condo.nome}</h4>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>NIF: {condo.nif || 'N/A'}</p>
                    </div>
                  </div>
                  <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem', marginBottom: '16px' }}>
                    {condo.endereco || 'Endereço não cadastrado.'}
                  </p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '16px' }}>
                  <button 
                    onClick={() => openCreateUser(condo.id)}
                    style={{ background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <User size={14} />
                    Criar Admin
                  </button>

                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button onClick={() => openEditCondo(condo)} style={{ background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer' }}>
                      <Edit size={18} />
                    </button>
                    <button onClick={() => handleDeleteCondo(condo.id)} style={{ background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer' }}>
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {filteredCondominios.length === 0 && (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                Nenhum condomínio encontrado.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal Condomínio */}
      {isCondoModalOpen && (
        <div style={{ 
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', 
          background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', 
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 
        }}>
          <div className="glass" style={{ width: '100%', maxWidth: '500px', padding: '32px', position: 'relative' }}>
            <button onClick={() => setIsCondoModalOpen(false)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer' }}>
              <X size={20} />
            </button>
            <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '24px', color: 'white' }}>
              {editingCondo ? 'Editar Condomínio' : 'Novo Condomínio'}
            </h3>
            <form onSubmit={handleCondoSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <input type="text" name="nome" placeholder="Nome do Condomínio" value={condoFormData.nome} onChange={handleCondoInputChange} style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white' }} required />
              </div>
              <div>
                <input type="text" name="nif" placeholder="NIF" value={condoFormData.nif} onChange={handleCondoInputChange} style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white' }} />
              </div>
              <div>
                <input type="text" name="endereco" placeholder="Endereço" value={condoFormData.endereco} onChange={handleCondoInputChange} style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white' }} />
              </div>
              <button type="submit" className="btn-primary" style={{ marginTop: '8px' }}>Salvar</button>
            </form>
          </div>
        </div>
      )}

      {/* Modal Usuário Admin */}
      {isUserModalOpen && (
        <div style={{ 
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', 
          background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', 
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 
        }}>
          <div className="glass" style={{ width: '100%', maxWidth: '500px', padding: '32px', position: 'relative' }}>
            <button onClick={() => setIsUserModalOpen(false)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer' }}>
              <X size={20} />
            </button>
            <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '24px', color: 'white' }}>
              Criar Administrador
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '16px' }}>
              Cadastre um usuário para gerenciar este condomínio.
            </p>
            <form onSubmit={handleUserSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <input type="email" name="email" placeholder="E-mail do Administrador" value={userFormData.email} onChange={handleUserInputChange} style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white' }} required />
              </div>
              <div>
                <input type="password" name="senha" placeholder="Senha" value={userFormData.senha} onChange={handleUserInputChange} style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white' }} required />
              </div>
              <button type="submit" className="btn-primary" style={{ marginTop: '8px' }}>Criar Usuário</button>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
