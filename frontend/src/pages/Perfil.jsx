import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { User, Mail, Lock, Shield, Globe, Phone, CreditCard, Save } from 'lucide-react';
import axios from 'axios';

export default function Perfil() {
  const [profile, setProfile] = useState({
    nome: '',
    email: '',
    role: '',
    telefone: '',
    nif: '',
    condominioNome: ''
  });
  
  const [emailForm, setEmailForm] = useState('');
  const [passwordForm, setPasswordForm] = useState({
    senhaAtual: '',
    novaSenha: '',
    confirmarNovaSenha: ''
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    if (!token) {
      window.location.href = '/login';
      return;
    }
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/v1/usuarios/me', { headers });
      setProfile(response.data);
      setEmailForm(response.data.email);
      setLoading(false);
    } catch (err) {
      setError('Erro ao carregar perfil.');
      setLoading(false);
    }
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    try {
      const response = await axios.put('http://localhost:8080/api/v1/usuarios/me', { email: emailForm }, { headers });
      setProfile(response.data);
      setSuccessMessage('E-mail atualizado com sucesso!');
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      setError('Erro ao atualizar e-mail. Verifique se já está em uso.');
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (passwordForm.novaSenha !== passwordForm.confirmarNovaSenha) {
      setPasswordError('As senhas não coincidem.');
      return;
    }

    if (passwordForm.novaSenha.length < 6) {
      setPasswordError('A nova senha deve ter pelo menos 6 caracteres.');
      return;
    }

    try {
      await axios.put('http://localhost:8080/api/v1/usuarios/me/senha', {
        senhaAtual: passwordForm.senhaAtual,
        novaSenha: passwordForm.novaSenha
      }, { headers });

      setPasswordSuccess('Senha alterada com sucesso!');
      setPasswordForm({ senhaAtual: '', novaSenha: '', confirmarNovaSenha: '' });
      setTimeout(() => setPasswordSuccess(''), 4000);
    } catch (err) {
      setPasswordError('Erro ao alterar senha. Verifique a senha atual.');
    }
  };

  return (
    <Layout>
      <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Cabeçalho */}
        <div>
          <h3 style={{ fontSize: '1.5rem', fontWeight: '600', color: 'white' }}>Gestão de Perfil</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Configure os seus dados pessoais e de acesso.</p>
        </div>

        {loading ? (
          <div style={{ color: 'white', textAlign: 'center', padding: '20px' }}>Carregando...</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
            
            {/* Informações Gerais */}
            <div className="glass" style={{ padding: '32px', display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ 
                width: '80px', height: '80px', borderRadius: '50%', background: 'var(--gradient-primary)',
                display: 'flex', justifyContent: 'center', alignItems: 'center',
                boxShadow: '0 8px 24px rgba(96, 165, 250, 0.25)'
              }}>
                <User size={36} color="white" />
              </div>
              <div style={{ flex: 1, minWidth: '200px' }}>
                <h4 style={{ fontSize: '1.25rem', fontWeight: '600', color: 'white', margin: '0 0 4px 0' }}>{profile.nome}</h4>
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '8px' }}>
                  <span style={{ 
                    display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.875rem', 
                    color: 'var(--text-muted)' 
                  }}>
                    <Shield size={16} /> {profile.role}
                  </span>
                  <span style={{ 
                    display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.875rem', 
                    color: 'var(--text-muted)' 
                  }}>
                    <Globe size={16} /> {profile.condominioNome}
                  </span>
                </div>
              </div>
            </div>

            {/* Form de E-mail */}
            <div className="glass" style={{ padding: '32px' }}>
              <h4 style={{ fontSize: '1.1rem', fontWeight: '600', color: 'white', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Mail size={20} className="text-gradient" /> Alterar E-mail
              </h4>

              {error && <div style={{ color: '#ef4444', marginBottom: '16px', fontSize: '0.875rem' }}>{error}</div>}
              {successMessage && <div style={{ color: '#10b981', marginBottom: '16px', fontSize: '0.875rem' }}>{successMessage}</div>}

              <form onSubmit={handleEmailSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', flexWrap: 'wrap' }}>
                  
                  {/* Nome (Apenas leitura) */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Nome Completo</label>
                    <div style={{ position: 'relative' }}>
                      <User size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                      <input 
                        type="text" value={profile.nome} disabled 
                        style={{ width: '100%', padding: '12px 12px 12px 40px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', color: 'var(--text-muted)', cursor: 'not-allowed' }}
                      />
                    </div>
                  </div>

                  {/* E-mail (Editável) */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ color: 'white', fontSize: '0.875rem' }}>Endereço de E-mail</label>
                    <div style={{ position: 'relative' }}>
                      <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                      <input 
                        type="email" value={emailForm} onChange={(e) => setEmailForm(e.target.value)} required
                        style={{ width: '100%', padding: '12px 12px 12px 40px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white' }}
                      />
                    </div>
                  </div>

                  {/* Telefone (Leitura) */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Telefone</label>
                    <div style={{ position: 'relative' }}>
                      <Phone size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                      <input 
                        type="text" value={profile.telefone || '-'} disabled 
                        style={{ width: '100%', padding: '12px 12px 12px 40px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', color: 'var(--text-muted)', cursor: 'not-allowed' }}
                      />
                    </div>
                  </div>

                  {/* NIF (Leitura) */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>NIF</label>
                    <div style={{ position: 'relative' }}>
                      <CreditCard size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                      <input 
                        type="text" value={profile.nif || '-'} disabled 
                        style={{ width: '100%', padding: '12px 12px 12px 40px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', color: 'var(--text-muted)', cursor: 'not-allowed' }}
                      />
                    </div>
                  </div>

                </div>

                <button type="submit" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', alignSelf: 'flex-end', marginTop: '8px' }}>
                  <Save size={18} /> Salvar E-mail
                </button>
              </form>
            </div>

            {/* Form de Senha */}
            <div className="glass" style={{ padding: '32px' }}>
              <h4 style={{ fontSize: '1.1rem', fontWeight: '600', color: 'white', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Lock size={20} className="text-gradient" /> Alterar Senha
              </h4>

              {passwordError && <div style={{ color: '#ef4444', marginBottom: '16px', fontSize: '0.875rem' }}>{passwordError}</div>}
              {passwordSuccess && <div style={{ color: '#10b981', marginBottom: '16px', fontSize: '0.875rem' }}>{passwordSuccess}</div>}

              <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                
                {/* Senha Atual */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ color: 'white', fontSize: '0.875rem' }}>Senha Atual</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input 
                      type="password" required
                      value={passwordForm.senhaAtual} 
                      onChange={(e) => setPasswordForm({ ...passwordForm, senhaAtual: e.target.value })}
                      placeholder="Introduza a sua senha atual"
                      style={{ width: '100%', padding: '12px 12px 12px 40px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', flexWrap: 'wrap' }}>
                  
                  {/* Nova Senha */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ color: 'white', fontSize: '0.875rem' }}>Nova Senha</label>
                    <div style={{ position: 'relative' }}>
                      <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                      <input 
                        type="password" required
                        value={passwordForm.novaSenha} 
                        onChange={(e) => setPasswordForm({ ...passwordForm, novaSenha: e.target.value })}
                        placeholder="Nova senha (min. 6 caracteres)"
                        style={{ width: '100%', padding: '12px 12px 12px 40px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white' }}
                      />
                    </div>
                  </div>

                  {/* Confirmar Nova Senha */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ color: 'white', fontSize: '0.875rem' }}>Confirmar Nova Senha</label>
                    <div style={{ position: 'relative' }}>
                      <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                      <input 
                        type="password" required
                        value={passwordForm.confirmarNovaSenha} 
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmarNovaSenha: e.target.value })}
                        placeholder="Confirme a nova senha"
                        style={{ width: '100%', padding: '12px 12px 12px 40px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white' }}
                      />
                    </div>
                  </div>

                </div>

                <button type="submit" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', alignSelf: 'flex-end', marginTop: '8px' }}>
                  <Lock size={18} /> Alterar Senha
                </button>
              </form>
            </div>

          </div>
        )}
      </div>
    </Layout>
  );
}
