package com.domussmart.service;

import com.domussmart.model.TaxaCondominial;
import com.domussmart.repository.TaxaCondominialRepository;
import com.domussmart.repository.PagamentoRepository;
import com.domussmart.model.Pagamento;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class TaxaCondominialService {

    @Autowired
    private TaxaCondominialRepository taxaCondominialRepository;

    @Autowired
    private PagamentoRepository pagamentoRepository;

    public List<TaxaCondominial> listarTodos() {
        return taxaCondominialRepository.findAll();
    }

    public List<TaxaCondominial> listarPorCondominio(Long condominioId) {
        return taxaCondominialRepository.findByUnidadeBlocoCondominioId(condominioId);
    }

    public Optional<TaxaCondominial> buscarPorId(Long id) {
        return taxaCondominialRepository.findById(id);
    }

    public TaxaCondominial salvar(TaxaCondominial taxaCondominial) {
        return taxaCondominialRepository.save(taxaCondominial);
    }

    @Transactional
    public void deletar(Long id) {
        List<Pagamento> pagamentos = pagamentoRepository.findByTaxaCondominialId(id);
        pagamentoRepository.deleteAll(pagamentos);
        taxaCondominialRepository.deleteById(id);
    }
}
