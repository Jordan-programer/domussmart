package com.domussmart.service;

import com.domussmart.model.TaxaCondominial;
import com.domussmart.repository.TaxaCondominialRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class TaxaCondominialService {

    @Autowired
    private TaxaCondominialRepository taxaCondominialRepository;

    public List<TaxaCondominial> listarTodos() {
        return taxaCondominialRepository.findAll();
    }

    public Optional<TaxaCondominial> buscarPorId(Long id) {
        return taxaCondominialRepository.findById(id);
    }

    public TaxaCondominial salvar(TaxaCondominial taxaCondominial) {
        return taxaCondominialRepository.save(taxaCondominial);
    }

    public void deletar(Long id) {
        taxaCondominialRepository.deleteById(id);
    }
}
