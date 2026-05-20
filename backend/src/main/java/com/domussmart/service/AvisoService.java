package com.domussmart.service;

import com.domussmart.model.Aviso;
import com.domussmart.repository.AvisoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class AvisoService {

    @Autowired
    private AvisoRepository avisoRepository;

    public List<Aviso> listarTodos() {
        return avisoRepository.findAll();
    }

    public List<Aviso> listarPorCondominio(Long condominioId) {
        return avisoRepository.findByCondominioId(condominioId);
    }

    public Optional<Aviso> buscarPorId(Long id) {
        return avisoRepository.findById(id);
    }

    public Aviso salvar(Aviso aviso) {
        return avisoRepository.save(aviso);
    }

    public void deletar(Long id) {
        avisoRepository.deleteById(id);
    }
}
