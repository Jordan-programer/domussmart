package com.domussmart.service;

import com.domussmart.model.Morador;
import com.domussmart.repository.MoradorRepository;
import com.domussmart.repository.UsuarioRepository;
import com.domussmart.repository.ReservaRepository;
import com.domussmart.repository.ChamadoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class MoradorService {

    @Autowired
    private MoradorRepository moradorRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private ReservaRepository reservaRepository;

    @Autowired
    private ChamadoRepository chamadoRepository;

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

    @Transactional
    public void deletar(Long id) {
        usuarioRepository.findByMoradorId(id).ifPresent(usuario -> {
            usuario.setMorador(null);
            usuarioRepository.save(usuario);
        });
        reservaRepository.deleteAll(reservaRepository.findByMoradorId(id));
        chamadoRepository.deleteAll(chamadoRepository.findByMoradorId(id));
        moradorRepository.deleteById(id);
    }
}
