package com.domussmart.controller;

import com.domussmart.model.Morador;
import com.domussmart.model.Unidade;
import com.domussmart.model.Usuario;
import com.domussmart.service.MoradorService;
import com.domussmart.service.UnidadeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/moradores")
public class MoradorController {

    @Autowired
    private MoradorService moradorService;

    @Autowired
    private UnidadeService unidadeService;

    @GetMapping
    public List<Morador> listarTodos() {
        Usuario loggedUser = (Usuario) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (loggedUser.getCondominio() != null) {
            return moradorService.listarPorCondominio(loggedUser.getCondominio().getId());
        }
        return moradorService.listarTodos();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Morador> buscarPorId(@PathVariable Long id) {
        Usuario loggedUser = (Usuario) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return moradorService.buscarPorId(id)
                .map(morador -> {
                    if (loggedUser.getCondominio() != null && 
                        (morador.getUnidade() == null || morador.getUnidade().getBloco() == null || 
                         morador.getUnidade().getBloco().getCondominio() == null || 
                         !morador.getUnidade().getBloco().getCondominio().getId().equals(loggedUser.getCondominio().getId()))) {
                        return ResponseEntity.status(403).<Morador>build();
                    }
                    return ResponseEntity.ok(morador);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Morador> salvar(@RequestBody Morador morador) {
        Usuario loggedUser = (Usuario) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (loggedUser.getCondominio() != null) {
            if (morador.getUnidade() == null || morador.getUnidade().getId() == null) {
                return ResponseEntity.badRequest().build();
            }
            Optional<Unidade> unidadeOpt = unidadeService.buscarPorId(morador.getUnidade().getId());
            if (unidadeOpt.isEmpty() || unidadeOpt.get().getBloco() == null || unidadeOpt.get().getBloco().getCondominio() == null ||
                !unidadeOpt.get().getBloco().getCondominio().getId().equals(loggedUser.getCondominio().getId())) {
                return ResponseEntity.status(403).build();
            }
        }
        return ResponseEntity.ok(moradorService.salvar(morador));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        Usuario loggedUser = (Usuario) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Optional<Morador> moradorOpt = moradorService.buscarPorId(id);
        if (moradorOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Morador morador = moradorOpt.get();
        if (loggedUser.getCondominio() != null && 
            (morador.getUnidade() == null || morador.getUnidade().getBloco() == null || 
             morador.getUnidade().getBloco().getCondominio() == null || 
             !morador.getUnidade().getBloco().getCondominio().getId().equals(loggedUser.getCondominio().getId()))) {
            return ResponseEntity.status(403).build();
        }
        moradorService.deletar(id);
        return ResponseEntity.noContent().build();
    }
}
