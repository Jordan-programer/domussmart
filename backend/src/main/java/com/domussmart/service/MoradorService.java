package com.domussmart.service;

import com.domussmart.model.Morador;
import com.domussmart.repository.MoradorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class MoradorService {

    @Autowired
    private MoradorRepository moradorRepository;

    public List<Morador> listarTodos() {
        return moradorRepository.findAll();
    }

    public List<Morador> listarPorCondominio(Long condominioId) {
        return moradorRepository.findByUnidadeBlocoCondominioId(condominioId);
    }

    public Optional<Morador> buscarPorId(Long id) {
        return moradorRepository.findById(id);
    }

    public Morador salvar(Morador morador) {
        return moradorRepository.save(morador);
    }

    public void deletar(Long id) {
        moradorRepository.deleteById(id);
    }
}
