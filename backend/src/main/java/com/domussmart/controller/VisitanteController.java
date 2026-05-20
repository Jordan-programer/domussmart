package com.domussmart.controller;

import com.domussmart.model.Unidade;
import com.domussmart.model.Usuario;
import com.domussmart.model.Visitante;
import com.domussmart.service.UnidadeService;
import com.domussmart.service.VisitanteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/visitantes")
public class VisitanteController {

    @Autowired
    private VisitanteService visitanteService;

    @Autowired
    private UnidadeService unidadeService;

    @GetMapping
    public List<Visitante> listarTodos() {
        Usuario loggedUser = (Usuario) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (loggedUser.getRole() == Usuario.Role.MORADOR) {
            if (loggedUser.getMorador() != null && loggedUser.getMorador().getUnidade() != null) {
                return visitanteService.listarPorCondominio(loggedUser.getCondominio().getId())
                        .stream()
                        .filter(v -> v.getUnidade() != null && v.getUnidade().getId().equals(loggedUser.getMorador().getUnidade().getId()))
                        .toList();
            }
            return List.of();
        }
        if (loggedUser.getCondominio() != null) {
            return visitanteService.listarPorCondominio(loggedUser.getCondominio().getId());
        }
        return visitanteService.listarTodos();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Visitante> buscarPorId(@PathVariable Long id) {
        Usuario loggedUser = (Usuario) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return visitanteService.buscarPorId(id)
                .map(visitante -> {
                    if (loggedUser.getCondominio() != null && 
                        (visitante.getUnidade() == null || visitante.getUnidade().getBloco() == null || 
                         visitante.getUnidade().getBloco().getCondominio() == null || 
                         !visitante.getUnidade().getBloco().getCondominio().getId().equals(loggedUser.getCondominio().getId()))) {
                        return ResponseEntity.status(403).<Visitante>build();
                    }
                    if (loggedUser.getRole() == Usuario.Role.MORADOR && 
                        (visitante.getUnidade() == null || !visitante.getUnidade().getId().equals(loggedUser.getMorador().getUnidade().getId()))) {
                        return ResponseEntity.status(403).<Visitante>build();
                    }
                    return ResponseEntity.ok(visitante);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Visitante> salvar(@RequestBody Visitante visitante) {
        Usuario loggedUser = (Usuario) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (loggedUser.getRole() == Usuario.Role.MORADOR) {
            if (loggedUser.getMorador() == null || loggedUser.getMorador().getUnidade() == null || 
                visitante.getUnidade() == null || !visitante.getUnidade().getId().equals(loggedUser.getMorador().getUnidade().getId())) {
                return ResponseEntity.status(403).build();
            }
        }
        if (loggedUser.getCondominio() != null) {
            if (visitante.getUnidade() == null || visitante.getUnidade().getId() == null) {
                return ResponseEntity.badRequest().build();
            }
            Optional<Unidade> unidadeOpt = unidadeService.buscarPorId(visitante.getUnidade().getId());
            if (unidadeOpt.isEmpty() || unidadeOpt.get().getBloco() == null || unidadeOpt.get().getBloco().getCondominio() == null ||
                !unidadeOpt.get().getBloco().getCondominio().getId().equals(loggedUser.getCondominio().getId())) {
                return ResponseEntity.status(403).build();
            }
        }
        visitante.setRegistradoPor(loggedUser);
        return ResponseEntity.ok(visitanteService.salvar(visitante));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        Usuario loggedUser = (Usuario) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Optional<Visitante> visitanteOpt = visitanteService.buscarPorId(id);
        if (visitanteOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Visitante visitante = visitanteOpt.get();
        if (loggedUser.getCondominio() != null && 
            (visitante.getUnidade() == null || visitante.getUnidade().getBloco() == null || 
             visitante.getUnidade().getBloco().getCondominio() == null || 
             !visitante.getUnidade().getBloco().getCondominio().getId().equals(loggedUser.getCondominio().getId()))) {
            return ResponseEntity.status(403).build();
        }
        if (loggedUser.getRole() == Usuario.Role.MORADOR && 
            (visitante.getUnidade() == null || !visitante.getUnidade().getId().equals(loggedUser.getMorador().getUnidade().getId()))) {
            return ResponseEntity.status(403).build();
        }
        visitanteService.deletar(id);
        return ResponseEntity.noContent().build();
    }
}
