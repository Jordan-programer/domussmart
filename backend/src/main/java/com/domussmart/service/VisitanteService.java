package com.domussmart.service;

import com.domussmart.model.Visitante;
import com.domussmart.repository.VisitanteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class VisitanteService {

    @Autowired
    private VisitanteRepository visitanteRepository;

    public List<Visitante> listarTodos() {
        return visitanteRepository.findAll();
    }

    public Optional<Visitante> buscarPorId(Long id) {
        return visitanteRepository.findById(id);
    }

    public Visitante salvar(Visitante visitante) {
        return visitanteRepository.save(visitante);
    }

    public void deletar(Long id) {
        visitanteRepository.deleteById(id);
    }
}
