package com.domussmart.service;

import com.domussmart.model.Bloco;
import com.domussmart.repository.BlocoRepository;
import com.domussmart.repository.UnidadeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class BlocoService {

    @Autowired
    private BlocoRepository blocoRepository;

    @Autowired
    private UnidadeRepository unidadeRepository;

    @Autowired
    private UnidadeService unidadeService;

    public List<Bloco> listarTodos() {
        return blocoRepository.findAll();
    }

    public List<Bloco> listarPorCondominio(Long condominioId) {
        return blocoRepository.findByCondominioId(condominioId);
    }

    public Optional<Bloco> buscarPorId(Long id) {
        return blocoRepository.findById(id);
    }

    public Bloco salvar(Bloco bloco) {
        return blocoRepository.save(bloco);
    }

    @Transactional
    public void deletar(Long id) {
        unidadeRepository.findByBlocoId(id).forEach(u -> unidadeService.deletar(u.getId()));
        blocoRepository.deleteById(id);
    }
}
