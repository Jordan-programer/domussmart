import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { Building, CreditCard, MapPin, Save } from 'lucide-react';
import axios from 'axios';

export default function Condominio() {
  const [condominio, setCondominio] = useState(null);
  const [formData, setFormData] = useState({
    nome: '',
    nif: '',
    endereco: ''
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
    fetchCondominio();
  }, []);

  const fetchCondominio = async () => {
    try {
      // 1. Obter o perfil do usuário logado para descobrir o seu condomínio específico
      const userResponse = await axios.get('http://localhost:8080/api/v1/usuarios/me', { headers });
      const condoId = userResponse.data.condominioId;

      if (condoId) {
        // 2. Buscar as informações específicas deste condomínio
        const response = await axios.get(`http://localhost:8080/api/v1/condominios/${condoId}`, { headers });
        if (response.data) {
          setCondominio(response.data);
          setFormData({
            nome: response.data.nome,
            nif: response.data.nif || '',
            endereco: response.data.endereco || ''
          });
        }
      } else {
        setError('Você não possui um condomínio associado ao seu usuário.');
      }
      setLoading(false);
    } catch (err) {
      setError('Erro ao carregar dados do condomínio.');
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (condominio) {
        // Atualiza
        await axios.post('http://localhost:8080/api/v1/condominios', { id: condominio.id, ...formData }, { headers });
        localStorage.setItem('condominioNome', formData.nome);
        alert('Condomínio atualizado com sucesso!');
      } else {
        // Cria o primeiro
        const response = await axios.post('http://localhost:8080/api/v1/condominios', formData, { headers });
        setCondominio(response.data);
        localStorage.setItem('condominioNome', response.data.nome);
        alert('Condomínio cadastrado com sucesso!');
      }
      fetchCondominio();
    } catch (err) {
      alert('Erro ao salvar dados do condomínio.');
    }
  };

  return (
    <Layout>
      <div className="glass" style={{ padding: '32px', maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ marginBottom: '32px', textAlign: 'center' }}>
          <h3 style={{ fontSize: '1.75rem', fontWeight: '600', color: 'white', marginBottom: '8px' }}>Meu Condomínio</h3>
          <p style={{ color: 'var(--text-muted)' }}>Gerencie as informações gerais do condomínio.</p>
        </div>

        {loading ? (
          <div style={{ color: 'white', textAlign: 'center', padding: '20px' }}>Carregando...</div>
        ) : error ? (
          <div style={{ color: '#ef4444', textAlign: 'center', padding: '20px' }}>{error}</div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Nome */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Nome do Condomínio</label>
              <div style={{ position: 'relative' }}>
                <Building size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="text" name="nome" placeholder="Ex: Edifício Bella Vista" value={formData.nome} onChange={handleInputChange}
                  style={{ width: '100%', padding: '12px 12px 12px 40px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white' }}
                  required
                />
              </div>
            </div>

            {/* NIF */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>NIF</label>
              <div style={{ position: 'relative' }}>
                <CreditCard size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="text" name="nif" placeholder="Número de Identificação Fiscal" value={formData.nif} onChange={handleInputChange}
                  style={{ width: '100%', padding: '12px 12px 12px 40px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white' }}
                />
              </div>
            </div>

            {/* Endereço */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Endereço</label>
              <div style={{ position: 'relative' }}>
                <MapPin size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="text" name="endereco" placeholder="Rua, Número, Bairro, Cidade" value={formData.endereco} onChange={handleInputChange}
                  style={{ width: '100%', padding: '12px 12px 12px 40px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white' }}
                />
              </div>
            </div>

            <button type="submit" className="btn-primary" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '16px' }}>
              <Save size={20} />
              {condominio ? 'Salvar Alterações' : 'Cadastrar Condomínio'}
            </button>
          </form>
        )}
      </div>
    </Layout>
  );
}
