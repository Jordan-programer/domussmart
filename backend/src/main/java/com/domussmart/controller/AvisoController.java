package com.domussmart.controller;

import com.domussmart.model.Aviso;
import com.domussmart.model.Usuario;
import com.domussmart.service.AvisoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/avisos")
public class AvisoController {

    @Autowired
    private AvisoService avisoService;

    @GetMapping
    public List<Aviso> listarTodos() {
        Usuario loggedUser = (Usuario) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (loggedUser.getCondominio() != null) {
            return avisoService.listarPorCondominio(loggedUser.getCondominio().getId());
        }
        return avisoService.listarTodos();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Aviso> buscarPorId(@PathVariable Long id) {
        Usuario loggedUser = (Usuario) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return avisoService.buscarPorId(id)
                .map(aviso -> {
                    if (loggedUser.getCondominio() != null && 
                        (aviso.getCondominio() == null || !aviso.getCondominio().getId().equals(loggedUser.getCondominio().getId()))) {
                        return ResponseEntity.status(403).<Aviso>build();
                    }
                    return ResponseEntity.ok(aviso);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Aviso> salvar(@RequestBody Aviso aviso) {
        Usuario loggedUser = (Usuario) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (loggedUser.getCondominio() != null) {
            aviso.setCondominio(loggedUser.getCondominio());
        }
        return ResponseEntity.ok(avisoService.salvar(aviso));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        Usuario loggedUser = (Usuario) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Optional<Aviso> avisoOpt = avisoService.buscarPorId(id);
        if (avisoOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Aviso aviso = avisoOpt.get();
        if (loggedUser.getCondominio() != null && 
            (aviso.getCondominio() == null || !aviso.getCondominio().getId().equals(loggedUser.getCondominio().getId()))) {
            return ResponseEntity.status(403).build();
        }
        avisoService.deletar(id);
        return ResponseEntity.noContent().build();
    }
}
