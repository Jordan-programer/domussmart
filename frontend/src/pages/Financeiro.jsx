import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { Plus, Edit, Trash2, X, CreditCard, Calendar, Home, DollarSign, Check, AlertCircle, Search } from 'lucide-react';
import axios from 'axios';

export default function Financeiro() {
  const [activeTab, setActiveTab] = useState('despesas'); // 'despesas' ou 'taxas'
  const [searchTerm, setSearchTerm] = useState('');
  
  // States para Despesas
  const [despesas, setDespesas] = useState([]);
  const [isDespesaModalOpen, setIsDespesaModalOpen] = useState(false);
  const [editingDespesa, setEditingDespesa] = useState(null);
  const [despesaFormData, setDespesaFormData] = useState({
    descricao: '',
    valor: '',
    dataVencimento: '',
    paga: false
  });

  // States para Taxas Condominiais
  const [taxas, setTaxas] = useState([]);
  const [unidades, setUnidades] = useState([]);
  const [isTaxaModalOpen, setIsTaxaModalOpen] = useState(false);
  const [editingTaxa, setEditingTaxa] = useState(null);
  const [taxaFormData, setTaxaFormData] = useState({
    unidadeId: '',
    valor: '',
    dataVencimento: '',
    paga: false
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
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [despesasRes, taxasRes, unidadesRes] = await Promise.all([
        axios.get('http://localhost:8080/api/v1/despesas', { headers }),
        axios.get('http://localhost:8080/api/v1/taxas-condominiais', { headers }),
        axios.get('http://localhost:8080/api/v1/unidades', { headers })
      ]);
      
      setDespesas(despesasRes.data);
      setTaxas(taxasRes.data);
      setUnidades(unidadesRes.data);
      setLoading(false);
    } catch (err) {
      setError('Erro ao carregar dados financeiros.');
      setLoading(false);
    }
  };

  // Handlers para Despesas
  const handleDespesaInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setDespesaFormData({ 
      ...despesaFormData, 
      [name]: type === 'checkbox' ? checked : value 
    });
  };

  const handleEditDespesa = (despesa) => {
    setEditingDespesa(despesa);
    setDespesaFormData({
      descricao: despesa.descricao,
      valor: despesa.valor.toString(),
      dataVencimento: despesa.dataVencimento,
      paga: despesa.paga
    });
    setIsDespesaModalOpen(true);
  };

  const handleDespesaSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        descricao: despesaFormData.descricao,
        valor: parseFloat(despesaFormData.valor),
        dataVencimento: despesaFormData.dataVencimento,
        paga: despesaFormData.paga
      };

      if (editingDespesa) {
        payload.id = editingDespesa.id;
      }

      await axios.post('http://localhost:8080/api/v1/despesas', payload, { headers });
      
      setIsDespesaModalOpen(false);
      setEditingDespesa(null);
      setDespesaFormData({ descricao: '', valor: '', dataVencimento: '', paga: false });
      fetchData();
    } catch (err) {
      alert('Erro ao salvar despesa.');
    }
  };

  const handleDeleteDespesa = async (id) => {
    if (window.confirm('Deseja realmente excluir esta despesa?')) {
      try {
        await axios.delete(`http://localhost:8080/api/v1/despesas/${id}`, { headers });
        fetchData();
      } catch (err) {
        alert('Erro ao excluir despesa.');
      }
    }
  };

  // Handlers para Taxas Condominiais
  const handleTaxaInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setTaxaFormData({ 
      ...taxaFormData, 
      [name]: type === 'checkbox' ? checked : value 
    });
  };

  const handleEditTaxa = (taxa) => {
    setEditingTaxa(taxa);
    setTaxaFormData({
      unidadeId: taxa.unidade?.id || '',
      valor: taxa.valor.toString(),
      dataVencimento: taxa.dataVencimento,
      paga: taxa.paga
    });
    setIsTaxaModalOpen(true);
  };

  const handleTaxaSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        unidade: { id: parseInt(taxaFormData.unidadeId) },
        valor: parseFloat(taxaFormData.valor),
        dataVencimento: taxaFormData.dataVencimento,
        paga: taxaFormData.paga
      };

      if (editingTaxa) {
        payload.id = editingTaxa.id;
      }

      await axios.post('http://localhost:8080/api/v1/taxas-condominiais', payload, { headers });
      
      setIsTaxaModalOpen(false);
      setEditingTaxa(null);
      setTaxaFormData({ unidadeId: '', valor: '', dataVencimento: '', paga: false });
      fetchData();
    } catch (err) {
      alert('Erro ao salvar taxa condominial.');
    }
  };

  const handleDeleteTaxa = async (id) => {
    if (window.confirm('Deseja realmente excluir esta taxa?')) {
      try {
        await axios.delete(`http://localhost:8080/api/v1/taxas-condominiais/${id}`, { headers });
        fetchData();
      } catch (err) {
        alert('Erro ao excluir taxa.');
      }
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  // Filtragem
  const filteredDespesas = despesas.filter((despesa) => {
    const search = searchTerm.toLowerCase();
    return despesa.descricao.toLowerCase().includes(search);
  });

  const filteredTaxas = taxas.filter((taxa) => {
    const search = searchTerm.toLowerCase();
    return (
      taxa.unidade?.numero && taxa.unidade.numero.toLowerCase().includes(search)
    );
  });

  return (
    <Layout>
      <div style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.75rem', fontWeight: '600', color: 'white' }}>Gestão Financeira</h3>
            <p style={{ color: 'var(--text-muted)' }}>Controle de receitas e despesas do condomínio.</p>
          </div>

          {/* Barra de Pesquisa */}
          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder={activeTab === 'despesas' ? "Pesquisar por descrição..." : "Pesquisar por unidade..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ padding: '10px 12px 10px 40px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white', width: '250px' }}
            />
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px' }}>
          <button 
            onClick={() => { setActiveTab('despesas'); setSearchTerm(''); }}
            style={{ 
              background: 'transparent', border: 'none', color: activeTab === 'despesas' ? 'var(--secondary)' : 'var(--text-muted)', 
              fontSize: '1rem', fontWeight: '600', cursor: 'pointer', padding: '8px 16px', position: 'relative'
            }}
          >
            Despesas (Saídas)
            {activeTab === 'despesas' && <div style={{ position: 'absolute', bottom: '-13px', left: 0, width: '100%', height: '2px', background: 'var(--secondary)' }} />}
          </button>
          <button 
            onClick={() => { setActiveTab('taxas'); setSearchTerm(''); }}
            style={{ 
              background: 'transparent', border: 'none', color: activeTab === 'taxas' ? 'var(--secondary)' : 'var(--text-muted)', 
              fontSize: '1rem', fontWeight: '600', cursor: 'pointer', padding: '8px 16px', position: 'relative'
            }}
          >
            Mensalidades (Receitas)
            {activeTab === 'taxas' && <div style={{ position: 'absolute', bottom: '-13px', left: 0, width: '100%', height: '2px', background: 'var(--secondary)' }} />}
          </button>
        </div>

        {loading ? (
          <div style={{ color: 'white', textAlign: 'center', padding: '20px' }}>Carregando...</div>
        ) : error ? (
          <div style={{ color: '#ef4444', textAlign: 'center', padding: '20px' }}>{error}</div>
        ) : (
          <>
            {/* Tab Despesas */}
            {activeTab === 'despesas' && (
              <div className="glass" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <h4 style={{ fontSize: '1.25rem', fontWeight: '600', color: 'white' }}>Lista de Despesas</h4>
                  <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => setIsDespesaModalOpen(true)}>
                    <Plus size={18} />
                    Nova Despesa
                  </button>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', color: 'white' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'left' }}>
                        <th style={{ padding: '12px', color: 'var(--text-muted)' }}>Descrição</th>
                        <th style={{ padding: '12px', color: 'var(--text-muted)' }}>Valor</th>
                        <th style={{ padding: '12px', color: 'var(--text-muted)' }}>Vencimento</th>
                        <th style={{ padding: '12px', color: 'var(--text-muted)' }}>Status</th>
                        <th style={{ padding: '12px', color: 'var(--text-muted)', textAlign: 'center' }}>Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredDespesas.map((despesa) => (
                        <tr key={despesa.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <td style={{ padding: '12px' }}>{despesa.descricao}</td>
                          <td style={{ padding: '12px' }}>{formatCurrency(despesa.valor)}</td>
                          <td style={{ padding: '12px' }}>{formatDate(despesa.dataVencimento)}</td>
                          <td style={{ padding: '12px' }}>
                            <span style={{ 
                              padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '600',
                              background: despesa.paga ? 'rgba(34, 197, 94, 0.2)' : 'rgba(234, 179, 8, 0.2)',
                              color: despesa.paga ? '#4ade80' : '#facc15'
                            }}>
                              {despesa.paga ? 'PAGA' : 'PENDENTE'}
                            </span>
                          </td>
                          <td style={{ padding: '12px', display: 'flex', justifyContent: 'center', gap: '12px' }}>
                            <button onClick={() => handleEditDespesa(despesa)} style={{ background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer' }}>
                              <Edit size={16} />
                            </button>
                            <button onClick={() => handleDeleteDespesa(despesa.id)} style={{ background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer' }}>
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {filteredDespesas.length === 0 && (
                        <tr>
                          <td colSpan="5" style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>Nenhuma despesa encontrada.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Tab Taxas */}
            {activeTab === 'taxas' && (
              <div className="glass" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <h4 style={{ fontSize: '1.25rem', fontWeight: '600', color: 'white' }}>Cobranças de Mensalidades</h4>
                  <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => setIsTaxaModalOpen(true)}>
                    <Plus size={18} />
                    Gerar Cobrança
                  </button>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', color: 'white' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'left' }}>
                        <th style={{ padding: '12px', color: 'var(--text-muted)' }}>Unidade</th>
                        <th style={{ padding: '12px', color: 'var(--text-muted)' }}>Valor</th>
                        <th style={{ padding: '12px', color: 'var(--text-muted)' }}>Vencimento</th>
                        <th style={{ padding: '12px', color: 'var(--text-muted)' }}>Status</th>
                        <th style={{ padding: '12px', color: 'var(--text-muted)', textAlign: 'center' }}>Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTaxas.map((taxa) => (
                        <tr key={taxa.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <td style={{ padding: '12px' }}>Unidade {taxa.unidade?.numero}</td>
                          <td style={{ padding: '12px' }}>{formatCurrency(taxa.valor)}</td>
                          <td style={{ padding: '12px' }}>{formatDate(taxa.dataVencimento)}</td>
                          <td style={{ padding: '12px' }}>
                            <span style={{ 
                              padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '600',
                              background: taxa.paga ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                              color: taxa.paga ? '#4ade80' : '#f87171'
                            }}>
                              {taxa.paga ? 'LIQUIDADO' : 'EM ABERTO'}
                            </span>
                          </td>
                          <td style={{ padding: '12px', display: 'flex', justifyContent: 'center', gap: '12px' }}>
                            <button onClick={() => handleEditTaxa(taxa)} style={{ background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer' }}>
                              <Edit size={16} />
                            </button>
                            <button onClick={() => handleDeleteTaxa(taxa.id)} style={{ background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer' }}>
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {filteredTaxas.length === 0 && (
                        <tr>
                          <td colSpan="5" style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>Nenhuma cobrança encontrada.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal Despesa */}
      {isDespesaModalOpen && (
        <div style={{ 
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', 
          background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', 
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 
        }}>
          <div className="glass" style={{ width: '100%', maxWidth: '500px', padding: '32px', position: 'relative' }}>
            <button onClick={() => setIsDespesaModalOpen(false)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer' }}>
              <X size={20} />
            </button>
            <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '24px', color: 'white' }}>
              {editingItem ? 'Editar Despesa' : 'Cadastrar Despesa'}
            </h3>
            <form onSubmit={handleDespesaSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <input type="text" name="descricao" placeholder="Descrição da Despesa" value={despesaFormData.descricao} onChange={handleDespesaInputChange} style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white' }} required />
              </div>
              <div>
                <input type="number" step="0.01" name="valor" placeholder="Valor (R$)" value={despesaFormData.valor} onChange={handleDespesaInputChange} style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white' }} required />
              </div>
              <div>
                <input type="date" name="dataVencimento" value={despesaFormData.dataVencimento} onChange={handleDespesaInputChange} style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white' }} required />
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'white', cursor: 'pointer' }}>
                <input type="checkbox" name="paga" checked={despesaFormData.paga} onChange={handleDespesaInputChange} style={{ width: '18px', height: '18px' }} />
                <span>Já está paga?</span>
              </label>
              <button type="submit" className="btn-primary" style={{ marginTop: '8px' }}>Salvar</button>
            </form>
          </div>
        </div>
      )}

      {/* Modal Taxa */}
      {isTaxaModalOpen && (
        <div style={{ 
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', 
          background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', 
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 
        }}>
          <div className="glass" style={{ width: '100%', maxWidth: '500px', padding: '32px', position: 'relative' }}>
            <button onClick={() => setIsTaxaModalOpen(false)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer' }}>
              <X size={20} />
            </button>
            <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '24px', color: 'white' }}>
              {editingTaxa ? 'Editar Cobrança' : 'Gerar Cobrança'}
            </h3>
            <form onSubmit={handleTaxaSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <select name="unidadeId" value={taxaFormData.unidadeId} onChange={handleTaxaInputChange} style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white' }} required>
                  <option value="" style={{ background: '#0f172a' }}>Selecione a Unidade</option>
                  {unidades.map((unidade) => (
                    <option key={unidade.id} value={unidade.id} style={{ background: '#0f172a' }}>Unidade {unidade.numero}</option>
                  ))}
                </select>
              </div>
              <div>
                <input type="number" step="0.01" name="valor" placeholder="Valor (R$)" value={taxaFormData.valor} onChange={handleTaxaInputChange} style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white' }} required />
              </div>
              <div>
                <input type="date" name="dataVencimento" value={taxaFormData.dataVencimento} onChange={handleTaxaInputChange} style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white' }} required />
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'white', cursor: 'pointer' }}>
                <input type="checkbox" name="paga" checked={taxaFormData.paga} onChange={handleTaxaInputChange} style={{ width: '18px', height: '18px' }} />
                <span>Já está paga?</span>
              </label>
              <button type="submit" className="btn-primary" style={{ marginTop: '8px' }}>Salvar</button>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
