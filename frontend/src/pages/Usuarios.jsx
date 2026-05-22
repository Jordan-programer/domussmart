import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { Plus, Edit, Trash2, X, User, Lock, Mail, Shield, UserCheck, Search, Phone } from 'lucide-react';
import axios from 'axios';

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [moradores, setMoradores] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState({
    email: '',
    senha: '',
    role: 'PORTEIRO',
    moradorId: ''
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
    fetchUsuarios();
    fetchMoradores();
  }, []);

  const fetchUsuarios = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/v1/usuarios', { headers });
      setUsuarios(response.data);
      setLoading(false);
    } catch (err) {
      setError('Erro ao carregar usuários.');
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

  const handleEdit = (user) => {
    setEditingItem(user);
    setFormData({
      email: user.email,
      senha: '', // Vazio para não alterar por padrão
      role: user.role,
      moradorId: user.moradorId || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        email: formData.email,
        role: formData.role,
        moradorId: formData.role === 'MORADOR' && formData.moradorId ? parseInt(formData.moradorId) : null
      };

      if (formData.senha) {
        payload.senha = formData.senha;
      } else if (!editingItem) {
        alert('A senha é obrigatória para novos usuários.');
        return;
      }

      if (editingItem) {
        await axios.put(`http://localhost:8080/api/v1/usuarios/${editingItem.id}`, payload, { headers });
      } else {
        await axios.post('http://localhost:8080/api/v1/usuarios', payload, { headers });
      }

      setIsModalOpen(false);
      setEditingItem(null);
      setFormData({ email: '', senha: '', role: 'PORTEIRO', moradorId: '' });
      fetchUsuarios();
      alert(editingItem ? 'Usuário atualizado com sucesso!' : 'Usuário cadastrado com sucesso!');
    } catch (err) {
      alert('Erro ao salvar usuário. Verifique se o e-mail já existe.');
    }
  };

  const handleDelete = async (id) => {
    const loggedUserId = localStorage.getItem('userId');
    if (parseInt(loggedUserId) === id) {
      alert('Você não pode excluir sua própria conta!');
      return;
    }

    if (window.confirm('Deseja realmente excluir esta conta de usuário?')) {
      try {
        await axios.delete(`http://localhost:8080/api/v1/usuarios/${id}`, { headers });
        fetchUsuarios();
        alert('Usuário excluído com sucesso!');
      } catch (err) {
        alert('Erro ao excluir usuário.');
      }
    }
  };

  const openNewModal = () => {
    setEditingItem(null);
    setFormData({ email: '', senha: '', role: 'PORTEIRO', moradorId: '' });
    setIsModalOpen(true);
  };

  const filteredUsuarios = usuarios.filter((user) => {
    const search = searchTerm.toLowerCase();
    return (
      user.email.toLowerCase().includes(search) ||
      user.role.toLowerCase().includes(search) ||
      user.nome.toLowerCase().includes(search)
    );
  });

  return (
    <Layout>
      <div style={{ padding: '24px' }}>
        {/* Top Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.75rem', fontWeight: '600', color: 'white' }}>Controle de Usuários</h3>
            <p style={{ color: 'var(--text-muted)' }}>Gerencie as credenciais de login para Porteiros, Moradores e Síndicos.</p>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{ position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                placeholder="Pesquisar usuário..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ padding: '10px 12px 10px 40px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white', width: '250px' }}
              />
            </div>

            <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={openNewModal}>
              <Plus size={18} />
              Novo Usuário
            </button>
          </div>
        </div>

        {/* Content Table */}
        {loading ? (
          <div style={{ color: 'white', textAlign: 'center', padding: '20px' }}>Carregando...</div>
        ) : error ? (
          <div style={{ color: '#ef4444', textAlign: 'center', padding: '20px' }}>{error}</div>
        ) : (
          <div className="glass" style={{ overflowX: 'auto', borderRadius: '16px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', color: 'white' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.02)' }}>
                  <th style={{ padding: '16px 24px', fontWeight: '600' }}>Utilizador / E-mail</th>
                  <th style={{ padding: '16px 24px', fontWeight: '600' }}>Nome Associado</th>
                  <th style={{ padding: '16px 24px', fontWeight: '600' }}>Função</th>
                  <th style={{ padding: '16px 24px', fontWeight: '600' }}>Telefone</th>
                  <th style={{ padding: '16px 24px', fontWeight: '600', textAlign: 'right' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsuarios.map((user) => (
                  <tr key={user.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.3s' }} onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ padding: '8px', background: 'rgba(96, 165, 250, 0.1)', borderRadius: '10px', color: '#60a5fa' }}>
                        <User size={18} />
                      </div>
                      <span style={{ fontWeight: '500' }}>{user.email}</span>
                    </td>
                    <td style={{ padding: '16px 24px', color: 'rgba(255,255,255,0.8)' }}>{user.nome}</td>
                    <td style={{ padding: '16px 24px' }}>
                      <span style={{ 
                        padding: '4px 10px', 
                        borderRadius: '20px', 
                        fontSize: '0.75rem', 
                        fontWeight: 'bold',
                        background: user.role === 'SINDICO' ? 'rgba(99, 102, 241, 0.2)' : (user.role === 'PORTEIRO' ? 'rgba(234, 179, 8, 0.2)' : 'rgba(34, 197, 94, 0.2)'),
                        color: user.role === 'SINDICO' ? '#818cf8' : (user.role === 'PORTEIRO' ? '#facc15' : '#4ade80'),
                        border: '1px solid currentColor'
                      }}>
                        {user.role}
                      </span>
                    </td>
                    <td style={{ padding: '16px 24px', color: 'var(--text-muted)' }}>{user.telefone}</td>
                    <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '16px' }}>
                        <button onClick={() => handleEdit(user)} style={{ background: 'transparent', color: '#60a5fa', cursor: 'pointer', transition: 'transform 0.2s' }} onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.15)'} onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                          <Edit size={18} />
                        </button>
                        <button onClick={() => handleDelete(user.id)} style={{ background: 'transparent', color: '#f43f5e', cursor: 'pointer', transition: 'transform 0.2s' }} onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.15)'} onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredUsuarios.length === 0 && (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                      Nenhum usuário encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal - Cadastro e Edição */}
      {isModalOpen && (
        <div style={{ 
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', 
          background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', 
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 
        }}>
          <div className="glass" style={{ width: '100%', maxWidth: '500px', padding: '32px', position: 'relative' }}>
            {/* Fechar */}
            <button onClick={() => setIsModalOpen(false)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer' }}>
              <X size={20} />
            </button>

            <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '24px', color: 'white' }}>
              {editingItem ? 'Editar Usuário' : 'Novo Usuário do Sistema'}
            </h3>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* E-mail */}
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="email" 
                  name="email" 
                  placeholder="E-mail / Nome de Usuário" 
                  value={formData.email} 
                  onChange={handleInputChange} 
                  style={{ width: '100%', padding: '12px 12px 12px 40px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white' }} 
                  required 
                />
              </div>

              {/* Senha */}
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="password" 
                  name="senha" 
                  placeholder={editingItem ? "Nova Senha (deixe em branco para não alterar)" : "Senha de Acesso"} 
                  value={formData.senha} 
                  onChange={handleInputChange} 
                  style={{ width: '100%', padding: '12px 12px 12px 40px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white' }} 
                  required={!editingItem} 
                />
              </div>

              {/* Função / Role */}
              <div style={{ position: 'relative' }}>
                <Shield size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <select 
                  name="role" 
                  value={formData.role} 
                  onChange={handleInputChange} 
                  style={{ width: '100%', padding: '12px 12px 12px 40px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white' }} 
                  required
                >
                  <option value="PORTEIRO" style={{ background: '#0f172a' }}>Porteiro</option>
                  <option value="MORADOR" style={{ background: '#0f172a' }}>Morador</option>
                  <option value="SINDICO" style={{ background: '#0f172a' }}>Síndico (Gestor)</option>
                </select>
              </div>

              {/* Se for Morador, escolher perfil para vincular */}
              {formData.role === 'MORADOR' && (
                <div style={{ position: 'relative' }}>
                  <UserCheck size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <select 
                    name="moradorId" 
                    value={formData.moradorId} 
                    onChange={handleInputChange} 
                    style={{ width: '100%', padding: '12px 12px 12px 40px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white' }} 
                    required={formData.role === 'MORADOR'}
                  >
                    <option value="" style={{ background: '#0f172a' }}>Vincular a um Perfil de Morador...</option>
                    {moradores.map((morador) => (
                      <option key={morador.id} value={morador.id} style={{ background: '#0f172a' }}>
                        {morador.nome} (Unidade: {morador.unidade?.numero || 'Sem unidade'})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Botão Enviar */}
              <button type="submit" className="btn-primary" style={{ marginTop: '8px' }}>
                {editingItem ? 'Salvar Alterações' : 'Cadastrar Usuário'}
              </button>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
