import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { Plus, Edit, Trash2, X, CreditCard, Calendar, Home, DollarSign, Check, AlertCircle, Search, Copy } from 'lucide-react';
import axios from 'axios';

export default function Financeiro() {
  const isMorador = localStorage.getItem('role') === 'MORADOR';
  const [activeTab, setActiveTab] = useState(isMorador ? 'taxas' : 'despesas'); // 'despesas' ou 'taxas'
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

  // States para Pagamento (Fluxo Morador com Métodos Angolanos)
  const [currentUser, setCurrentUser] = useState(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedTaxa, setSelectedTaxa] = useState(null);
  const [formaPagamento, setFormaPagamento] = useState('MULTICAIXA_EXPRESS'); // MULTICAIXA_EXPRESS, REFERENCIA, IBAN
  const [copiedText, setCopiedText] = useState(false);
  const [mcxPhone, setMcxPhone] = useState('');

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
    if (isMorador) {
      fetchCurrentUser();
    }
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/v1/usuarios/me', { headers });
      setCurrentUser(response.data);
      if (response.data.moradorId) {
        localStorage.setItem('moradorId', response.data.moradorId);
      }
      if (response.data.unidadeId) {
        localStorage.setItem('unidadeId', response.data.unidadeId);
      }
    } catch (err) {
      console.error('Erro ao carregar dados do usuário:', err);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const endpoints = [
        axios.get('http://localhost:8080/api/v1/taxas-condominiais', { headers })
      ];
      if (!isMorador) {
        endpoints.push(axios.get('http://localhost:8080/api/v1/despesas', { headers }));
        endpoints.push(axios.get('http://localhost:8080/api/v1/unidades', { headers }));
      }

      const responses = await Promise.all(endpoints);

      setTaxas(responses[0].data);
      if (!isMorador) {
        setDespesas(responses[1].data);
        setUnidades(responses[2].data);
      }
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

  // Fluxo de Pagamento do Morador (Angola)
  const handleOpenPayment = (taxa) => {
    setSelectedTaxa(taxa);
    setFormaPagamento('MULTICAIXA_EXPRESS');
    setMcxPhone('');
    setIsPaymentModalOpen(true);
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTaxa) return;
    try {
      const payload = {
        taxaCondominial: { id: selectedTaxa.id },
        valorPago: selectedTaxa.valor,
        formaPagamento: formaPagamento
      };
      await axios.post('http://localhost:8080/api/v1/pagamentos', payload, { headers });
      setIsPaymentModalOpen(false);
      setSelectedTaxa(null);
      alert('Pagamento registado com sucesso!');
      fetchData();
    } catch (err) {
      alert('Erro ao registar pagamento.');
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  // Formatação para Kwanza Angolano (AOA)
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-AO', { minimumFractionDigits: 2 }).format(value) + ' Kz';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  // Referência Angolana Padrão no ATM (Padded com base na ID da taxa)
  const getMockReference = (id) => {
    const paddedId = String(id).padStart(4, '0');
    return `924 02${paddedId.substring(0, 2)} ${paddedId.substring(2)}`;
  };

  // Filtragem
  const filteredDespesas = despesas.filter((despesa) => {
    const search = searchTerm.toLowerCase();
    return despesa.descricao.toLowerCase().includes(search);
  });

  const filteredTaxas = taxas.filter((taxa) => {
    if (isMorador) {
      const currentUnidadeId = currentUser?.unidadeId || parseInt(localStorage.getItem('unidadeId'));
      return taxa.unidade?.id === currentUnidadeId;
    }
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
            <p style={{ color: 'var(--text-muted)' }}>
              {isMorador ? 'Visualize e efectue o pagamento de suas mensalidades condominiais.' : 'Controle de receitas e despesas do condomínio.'}
            </p>
          </div>

          {/* Barra de Pesquisa (Apenas para não morador) */}
          {!isMorador && (
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
          )}
        </div>

        {/* Tabs */}
        {!isMorador && (
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
        )}

        {loading ? (
          <div style={{ color: 'white', textAlign: 'center', padding: '20px' }}>Carregando...</div>
        ) : error ? (
          <div style={{ color: '#ef4444', textAlign: 'center', padding: '20px' }}>{error}</div>
        ) : (
          <>
            {/* Tab Despesas (Apenas Admin) */}
            {!isMorador && activeTab === 'despesas' && (
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
                            <button onClick={() => handleEditDespesa(despesa)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                              <Edit size={16} />
                            </button>
                            <button onClick={() => handleDeleteDespesa(despesa.id)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
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

            {/* Tab Taxas (Admin & Morador) */}
            {activeTab === 'taxas' && (
              <div className="glass" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <h4 style={{ fontSize: '1.25rem', fontWeight: '600', color: 'white' }}>
                    {isMorador ? 'Minhas Mensalidades' : 'Cobranças de Mensalidades'}
                  </h4>
                  {!isMorador && (
                    <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => setIsTaxaModalOpen(true)}>
                      <Plus size={18} />
                      Gerar Cobrança
                    </button>
                  )}
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
                            {isMorador ? (
                              !taxa.paga ? (
                                <button
                                  onClick={() => handleOpenPayment(taxa)}
                                  className="btn-primary"
                                  style={{
                                    display: 'flex', alignItems: 'center', gap: '6px',
                                    padding: '6px 12px', fontSize: '0.875rem'
                                  }}
                                >
                                  <CreditCard size={14} />
                                  Pagar
                                </button>
                              ) : (
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <Check size={14} style={{ color: '#4ade80' }} /> Pago
                                </span>
                              )
                            ) : (
                              <>
                                <button onClick={() => handleEditTaxa(taxa)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                                  <Edit size={16} />
                                </button>
                                <button onClick={() => handleDeleteTaxa(taxa.id)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                                  <Trash2 size={16} />
                                </button>
                              </>
                            )}
                          </td>
                        </tr>
                      ))}
                      {filteredTaxas.length === 0 && (
                        <tr>
                          <td colSpan="5" style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>
                            {isMorador ? 'Nenhuma mensalidade pendente ou cadastrada para sua unidade.' : 'Nenhuma cobrança encontrada.'}
                          </td>
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
            <button onClick={() => setIsDespesaModalOpen(false)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
              <X size={20} />
            </button>
            <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '24px', color: 'white' }}>
              {editingDespesa ? 'Editar Despesa' : 'Cadastrar Despesa'}
            </h3>
            <form onSubmit={handleDespesaSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <input type="text" name="descricao" placeholder="Descrição da Despesa" value={despesaFormData.descricao} onChange={handleDespesaInputChange} style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white' }} required />
              </div>
              <div>
                <input type="number" step="0.01" name="valor" placeholder="Valor" value={despesaFormData.valor} onChange={handleDespesaInputChange} style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white' }} required />
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
            <button onClick={() => setIsTaxaModalOpen(false)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
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
                <input type="number" step="0.01" name="valor" placeholder="Valor" value={taxaFormData.valor} onChange={handleTaxaInputChange} style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white' }} required />
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

      {/* Modal Pagamento (Apenas Morador - Métodos Angolanos) */}
      {isPaymentModalOpen && selectedTaxa && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
          <div className="glass" style={{ width: '100%', maxWidth: '550px', padding: '32px', position: 'relative', border: '1px solid rgba(255,255,255,0.2)' }}>
            <button onClick={() => setIsPaymentModalOpen(false)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
              <X size={20} />
            </button>

            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <span style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', padding: '6px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Pagamento via Multicaixa / Transf.
              </span>
              <h3 style={{ fontSize: '1.75rem', fontWeight: '700', marginTop: '12px', color: 'white' }}>
                Efectuar Pagamento
              </h3>
              <p style={{ color: 'var(--text-muted)', marginTop: '4px' }}>
                Valor da cobrança: <span style={{ color: '#4ade80', fontWeight: '700', fontSize: '1.15rem' }}>{formatCurrency(selectedTaxa.valor)}</span>
              </p>
            </div>

            {/* Forma de Pagamento - Seleção Angolana */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '28px' }}>
              {[
                { id: 'MULTICAIXA_EXPRESS', name: 'MCX Express' },
                { id: 'REFERENCIA', name: 'Referência MCX' },
                { id: 'IBAN', name: 'IBAN / Transf.' }
              ].map((method) => (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => setFormaPagamento(method.id)}
                  style={{
                    flex: 1,
                    padding: '12px 8px',
                    borderRadius: '12px',
                    border: formaPagamento === method.id ? '2px solid var(--secondary)' : '1px solid rgba(255,255,255,0.1)',
                    background: formaPagamento === method.id ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255,255,255,0.02)',
                    color: 'white',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    textAlign: 'center',
                    fontSize: '0.9rem'
                  }}
                >
                  {method.name}
                </button>
              ))}
            </div>

            <form onSubmit={handlePaymentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

              {/* Opção Multicaixa Express */}
              {formaPagamento === 'MULTICAIXA_EXPRESS' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ textAlign: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '2.5rem' }}>📱</span>
                    <h4 style={{ color: 'white', fontWeight: '600', marginTop: '8px' }}>Multicaixa Express</h4>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.825rem', marginTop: '4px' }}>
                      Confirme a transacção directamente no seu telemóvel.
                    </p>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Número de Telemóvel (Angola):</label>
                    <div style={{ display: 'flex', position: 'relative' }}>
                      <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'white', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.95rem' }}>
                        🇦🇴 +244
                      </span>
                      <input
                        type="tel"
                        placeholder="999 999 999"
                        value={mcxPhone}
                        onChange={(e) => setMcxPhone(e.target.value.replace(/\D/g, ''))}
                        maxLength="9"
                        style={{ width: '100%', padding: '12px 12px 12px 90px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white', letterSpacing: '0.05em' }}
                        required={formaPagamento === 'MULTICAIXA_EXPRESS'}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Opção Referência Multicaixa */}
              {formaPagamento === 'REFERENCIA' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', background: 'rgba(255,255,255,0.03)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ textAlign: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '2.5rem' }}>🏦</span>
                    <h4 style={{ color: 'white', fontWeight: '600', marginTop: '8px' }}>Pagamento por Referência</h4>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.825rem', marginTop: '4px' }}>
                      Pague no ATM / Multicaixa ou no seu Internet Banking.
                    </p>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Entidade:</span>
                      <span style={{ color: 'white', fontWeight: '700', fontFamily: 'monospace', fontSize: '1rem' }}>22344</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Referência:</span>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span style={{ color: 'white', fontWeight: '700', fontFamily: 'monospace', fontSize: '1rem' }}>
                          {getMockReference(selectedTaxa.id)}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy(getMockReference(selectedTaxa.id).replace(/\s/g, ''))}
                          style={{ background: 'transparent', border: 'none', color: 'var(--secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                          title="Copiar Referência"
                        >
                          <Copy size={14} />
                        </button>
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Montante:</span>
                      <span style={{ color: '#4ade80', fontWeight: '700', fontSize: '1rem' }}>{formatCurrency(selectedTaxa.valor)}</span>
                    </div>
                  </div>
                  {copiedText && <p style={{ color: '#4ade80', fontSize: '0.825rem', textAlign: 'center' }}>Referência copiada!</p>}
                </div>
              )}

              {/* Opção IBAN / Transferência */}
              {formaPagamento === 'IBAN' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', background: 'rgba(255,255,255,0.03)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ textAlign: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '2.5rem' }}>💸</span>
                    <h4 style={{ color: 'white', fontWeight: '600', marginTop: '8px' }}>Transferência Bancária</h4>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.825rem', marginTop: '4px' }}>
                      Efectue a transferência e confirme abaixo.
                    </p>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block' }}>Banco:</span>
                      <span style={{ color: 'white', fontWeight: '600', fontSize: '0.9rem' }}>BAI (Banco Angolano de Investimentos)</span>
                    </div>

                    <div>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block' }}>Beneficiário:</span>
                      <span style={{ color: 'white', fontWeight: '600', fontSize: '0.9rem' }}>DomuSmart Gestão Condominial, Lda</span>
                    </div>

                    <div>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block' }}>IBAN Angolano:</span>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2px' }}>
                        <span style={{ color: 'white', fontWeight: '700', fontFamily: 'monospace', fontSize: '0.85rem', wordBreak: 'break-all' }}>
                          AO06.0040.0000.7891.2345.1018.9
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy("AO06004000007891234510189")}
                          style={{ background: 'transparent', border: 'none', color: 'var(--secondary)', cursor: 'pointer', paddingLeft: '8px' }}
                          title="Copiar IBAN"
                        >
                          <Copy size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                  {copiedText && <p style={{ color: '#4ade80', fontSize: '0.825rem', textAlign: 'center' }}>IBAN copiado!</p>}
                </div>
              )}

              <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '16px', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  style={{ padding: '12px 24px', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white', cursor: 'pointer' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ padding: '12px 28px', fontWeight: 'bold' }}
                >
                  Confirmar e Pagar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
