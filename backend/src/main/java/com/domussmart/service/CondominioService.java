package com.domussmart.service;

import com.domussmart.model.Condominio;
import com.domussmart.repository.CondominioRepository;
import com.domussmart.repository.AvisoRepository;
import com.domussmart.repository.DespesaRepository;
import com.domussmart.repository.UsuarioRepository;
import com.domussmart.repository.BlocoRepository;
import com.domussmart.repository.VisitanteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class CondominioService {

    @Autowired
    private CondominioRepository condominioRepository;

    @Autowired
    private AvisoRepository avisoRepository;

    @Autowired
    private DespesaRepository despesaRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private BlocoRepository blocoRepository;

    @Autowired
    private VisitanteRepository visitanteRepository;

    @Autowired
    private BlocoService blocoService;

    public List<Condominio> listarTodos() {
        return condominioRepository.findAll();
    }

    public Optional<Condominio> buscarPorId(Long id) {
        return condominioRepository.findById(id);
    }

    public Condominio salvar(Condominio condominio) {
        return condominioRepository.save(condominio);
    }

    @Transactional
    public void deletar(Long id) {
        avisoRepository.deleteAll(avisoRepository.findByCondominioId(id));
        despesaRepository.deleteAll(despesaRepository.findByCondominioId(id));
        blocoRepository.findByCondominioId(id).forEach(b -> blocoService.deletar(b.getId()));
        
        usuarioRepository.findByCondominioId(id).forEach(user -> {
            visitanteRepository.findByRegistradoPorId(user.getId()).forEach(v -> {
                v.setRegistradoPor(null);
                visitanteRepository.save(v);
            });
            usuarioRepository.delete(user);
        });
        
        condominioRepository.deleteById(id);
    }
}
