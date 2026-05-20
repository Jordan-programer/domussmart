package com.domussmart.controller;

import com.domussmart.model.Bloco;
import com.domussmart.model.Usuario;
import com.domussmart.service.BlocoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/blocos")
public class BlocoController {

    @Autowired
    private BlocoService blocoService;

    @GetMapping
    public List<Bloco> listarTodos() {
        Usuario loggedUser = (Usuario) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (loggedUser.getCondominio() != null) {
            return blocoService.listarPorCondominio(loggedUser.getCondominio().getId());
        }
        return blocoService.listarTodos();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Bloco> buscarPorId(@PathVariable Long id) {
        Usuario loggedUser = (Usuario) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return blocoService.buscarPorId(id)
                .map(bloco -> {
                    if (loggedUser.getCondominio() != null && 
                        (bloco.getCondominio() == null || !bloco.getCondominio().getId().equals(loggedUser.getCondominio().getId()))) {
                        return ResponseEntity.status(403).<Bloco>build();
                    }
                    return ResponseEntity.ok(bloco);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Bloco> salvar(@RequestBody Bloco bloco) {
        Usuario loggedUser = (Usuario) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (loggedUser.getCondominio() != null) {
            bloco.setCondominio(loggedUser.getCondominio());
        }
        return ResponseEntity.ok(blocoService.salvar(bloco));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        Usuario loggedUser = (Usuario) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Optional<Bloco> blocoOpt = blocoService.buscarPorId(id);
        if (blocoOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Bloco bloco = blocoOpt.get();
        if (loggedUser.getCondominio() != null && 
            (bloco.getCondominio() == null || !bloco.getCondominio().getId().equals(loggedUser.getCondominio().getId()))) {
            return ResponseEntity.status(403).build();
        }
        blocoService.deletar(id);
        return ResponseEntity.noContent().build();
    }
}
