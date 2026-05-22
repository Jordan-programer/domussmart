package com.domussmart.service;

import com.domussmart.model.Unidade;
import com.domussmart.repository.UnidadeRepository;
import com.domussmart.repository.ChamadoRepository;
import com.domussmart.repository.VisitanteRepository;
import com.domussmart.repository.MoradorRepository;
import com.domussmart.repository.TaxaCondominialRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class UnidadeService {

    @Autowired
    private UnidadeRepository unidadeRepository;

    @Autowired
    private ChamadoRepository chamadoRepository;

    @Autowired
    private VisitanteRepository visitanteRepository;

    @Autowired
    private MoradorRepository moradorRepository;

    @Autowired
    private TaxaCondominialRepository taxaCondominialRepository;

    @Autowired
    private MoradorService moradorService;

    @Autowired
    private TaxaCondominialService taxaCondominialService;

    public List<Unidade> listarTodos() {
        return unidadeRepository.findAll();
    }

    public List<Unidade> listarPorCondominio(Long condominioId) {
        return unidadeRepository.findByBlocoCondominioId(condominioId);
    }

    public Optional<Unidade> buscarPorId(Long id) {
        return unidadeRepository.findById(id);
    }

    public Unidade salvar(Unidade unidade) {
        return unidadeRepository.save(unidade);
    }

    @Transactional
    public void deletar(Long id) {
        chamadoRepository.deleteAll(chamadoRepository.findByUnidadeId(id));
        visitanteRepository.deleteAll(visitanteRepository.findByUnidadeId(id));
        moradorRepository.findByUnidadeId(id).forEach(m -> moradorService.deletar(m.getId()));
        taxaCondominialRepository.findByUnidadeId(id).forEach(t -> taxaCondominialService.deletar(t.getId()));
        unidadeRepository.deleteById(id);
    }
}
