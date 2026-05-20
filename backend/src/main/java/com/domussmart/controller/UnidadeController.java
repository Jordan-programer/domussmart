package com.domussmart.controller;

import com.domussmart.model.Bloco;
import com.domussmart.model.Unidade;
import com.domussmart.model.Usuario;
import com.domussmart.service.BlocoService;
import com.domussmart.service.UnidadeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/unidades")
public class UnidadeController {

    @Autowired
    private UnidadeService unidadeService;

    @Autowired
    private BlocoService blocoService;

    @GetMapping
    public List<Unidade> listarTodos() {
        Usuario loggedUser = (Usuario) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (loggedUser.getCondominio() != null) {
            return unidadeService.listarPorCondominio(loggedUser.getCondominio().getId());
        }
        return unidadeService.listarTodos();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Unidade> buscarPorId(@PathVariable Long id) {
        Usuario loggedUser = (Usuario) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return unidadeService.buscarPorId(id)
                .map(unidade -> {
                    if (loggedUser.getCondominio() != null && 
                        (unidade.getBloco() == null || unidade.getBloco().getCondominio() == null || 
                         !unidade.getBloco().getCondominio().getId().equals(loggedUser.getCondominio().getId()))) {
                        return ResponseEntity.status(403).<Unidade>build();
                    }
                    return ResponseEntity.ok(unidade);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Unidade> salvar(@RequestBody Unidade unidade) {
        Usuario loggedUser = (Usuario) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (loggedUser.getCondominio() != null) {
            if (unidade.getBloco() == null || unidade.getBloco().getId() == null) {
                return ResponseEntity.badRequest().build();
            }
            Optional<Bloco> blocoOpt = blocoService.buscarPorId(unidade.getBloco().getId());
            if (blocoOpt.isEmpty() || blocoOpt.get().getCondominio() == null ||
                !blocoOpt.get().getCondominio().getId().equals(loggedUser.getCondominio().getId())) {
                return ResponseEntity.status(403).build();
            }
        }
        return ResponseEntity.ok(unidadeService.salvar(unidade));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        Usuario loggedUser = (Usuario) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Optional<Unidade> unidadeOpt = unidadeService.buscarPorId(id);
        if (unidadeOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Unidade unidade = unidadeOpt.get();
        if (loggedUser.getCondominio() != null && 
            (unidade.getBloco() == null || unidade.getBloco().getCondominio() == null || 
             !unidade.getBloco().getCondominio().getId().equals(loggedUser.getCondominio().getId()))) {
            return ResponseEntity.status(403).build();
        }
        unidadeService.deletar(id);
        return ResponseEntity.noContent().build();
    }
}
