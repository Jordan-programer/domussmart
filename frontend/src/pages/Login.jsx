import React, { useState } from 'react';
import { LogIn, Mail, Lock, UserPlus, CreditCard } from 'lucide-react';
import axios from 'axios';

export default function Login() {
  const [activeTab, setActiveTab] = useState('login'); // 'login' or 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Registration fields
  const [regEmail, setRegEmail] = useState('');
  const [regNif, setRegNif] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:8080/api/v1/auth/login', {
        email,
        senha: password
      });

      saveSessionAndRedirect(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Credenciais inválidas. Verifique seu e-mail e senha.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (regPassword !== regConfirmPassword) {
      setError('As senhas digitadas não coincidem.');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('http://localhost:8080/api/v1/auth/morador/register', {
        email: regEmail,
        nif: regNif,
        senha: regPassword
      });

      setSuccess('Cadastro concluído com sucesso! Redirecionando...');
      setTimeout(() => {
        saveSessionAndRedirect(response.data);
      }, 1500);
    } catch (err) {
      setError(err.response?.data || 'Erro ao realizar cadastro. Verifique os dados introduzidos ou contacte o síndico.');
    } finally {
      setLoading(false);
    }
  };

  const saveSessionAndRedirect = (data) => {
    localStorage.setItem('token', data.token);
    localStorage.setItem('email', data.email);
    localStorage.setItem('role', data.role);
    localStorage.setItem('condominioId', data.condominioId);
    localStorage.setItem('condominioNome', data.condominioNome);
    localStorage.setItem('userId', data.userId);
    if (data.moradorId) {
      localStorage.setItem('moradorId', data.moradorId);
    } else {
      localStorage.removeItem('moradorId');
    }
    if (data.unidadeId) {
      localStorage.setItem('unidadeId', data.unidadeId);
    } else {
      localStorage.removeItem('unidadeId');
    }

    if (data.role === 'ADMIN') {
      window.location.href = '/gestor-maximo';
    } else if (data.role === 'PORTEIRO') {
      window.location.href = '/portaria';
    } else {
      window.location.href = '/dashboard';
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <div className="glass" style={{ padding: '40px', width: '100%', maxWidth: '440px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h1 className="text-gradient" style={{ fontSize: '2.25rem', marginBottom: '4px', fontWeight: 'bold' }}>DomuSmart</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Gestão Inteligente de Condomínios</p>
        </div>

        {/* Tab Controls */}
        <div style={{ display: 'flex', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', marginBottom: '28px', gap: '16px' }}>
          <button
            type="button"
            onClick={() => { setActiveTab('login'); setError(''); setSuccess(''); }}
            style={{
              flex: 1,
              padding: '12px 6px',
              background: 'transparent',
              color: activeTab === 'login' ? 'white' : 'var(--text-muted)',
              fontWeight: activeTab === 'login' ? '600' : '400',
              borderBottom: activeTab === 'login' ? '2.5px solid #60a5fa' : '2.5px solid transparent',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              outline: 'none'
            }}
          >
            Entrar
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('register'); setError(''); setSuccess(''); }}
            style={{
              flex: 1,
              padding: '12px 6px',
              background: 'transparent',
              color: activeTab === 'register' ? 'white' : 'var(--text-muted)',
              fontWeight: activeTab === 'register' ? '600' : '400',
              borderBottom: activeTab === 'register' ? '2.5px solid #60a5fa' : '2.5px solid transparent',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              outline: 'none'
            }}
          >
            Registo de Morador
          </button>
        </div>

        {/* Render Forms */}
        {activeTab === 'login' ? (
          <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ position: 'relative' }}>
              <Mail size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="email"
                placeholder="E-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: '100%', padding: '12px 12px 12px 40px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white' }}
                required
              />
            </div>

            <div style={{ position: 'relative' }}>
              <Lock size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="password"
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: '100%', padding: '12px 12px 12px 40px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white' }}
                required
              />
            </div>

            {error && <p style={{ color: '#ef4444', fontSize: '0.85rem', lineHeight: '1.4', margin: 0 }}>{error}</p>}
            {success && <p style={{ color: '#10b981', fontSize: '0.85rem', lineHeight: '1.4', margin: 0 }}>{success}</p>}

            <button
              type="submit"
              className="btn-primary"
              style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', opacity: loading ? 0.7 : 1 }}
              disabled={loading}
            >
              <LogIn size={20} />
              {loading ? 'A processar...' : 'Entrar'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.825rem', lineHeight: '1.4', marginBottom: '8px' }}>
              Introduza o e-mail e NIF previamente informados ao síndico para criar as suas credenciais de acesso.
            </p>

            {/* Email */}
            <div style={{ position: 'relative' }}>
              <Mail size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="email"
                placeholder="E-mail Registado"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                style={{ width: '100%', padding: '12px 12px 12px 40px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white' }}
                required
              />
            </div>

            {/* NIF */}
            <div style={{ position: 'relative' }}>
              <CreditCard size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="NIF Registado"
                value={regNif}
                onChange={(e) => setRegNif(e.target.value)}
                style={{ width: '100%', padding: '12px 12px 12px 40px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white' }}
                required
              />
            </div>

            {/* Password */}
            <div style={{ position: 'relative' }}>
              <Lock size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="password"
                placeholder="Criar Senha de Acesso"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                style={{ width: '100%', padding: '12px 12px 12px 40px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white' }}
                required
              />
            </div>

            {/* Confirm Password */}
            <div style={{ position: 'relative' }}>
              <Lock size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="password"
                placeholder="Confirmar Senha"
                value={regConfirmPassword}
                onChange={(e) => setRegConfirmPassword(e.target.value)}
                style={{ width: '100%', padding: '12px 12px 12px 40px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white' }}
                required
              />
            </div>

            {error && <p style={{ color: '#f43f5e', fontSize: '0.85rem', lineHeight: '1.4', margin: 0 }}>{error}</p>}
            {success && <p style={{ color: '#10b981', fontSize: '0.85rem', lineHeight: '1.4', margin: 0 }}>{success}</p>}

            <button
              type="submit"
              className="btn-primary"
              style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', opacity: loading ? 0.7 : 1 }}
              disabled={loading}
            >
              <UserPlus size={20} />
              {loading ? 'A processar...' : 'Concluir Registo'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
