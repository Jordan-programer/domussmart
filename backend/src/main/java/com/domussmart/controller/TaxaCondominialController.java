package com.domussmart.controller;

import com.domussmart.model.TaxaCondominial;
import com.domussmart.model.Unidade;
import com.domussmart.model.Usuario;
import com.domussmart.service.TaxaCondominialService;
import com.domussmart.service.UnidadeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/taxas-condominiais")
public class TaxaCondominialController {

    @Autowired
    private TaxaCondominialService taxaCondominialService;

    @Autowired
    private UnidadeService unidadeService;

    @GetMapping
    public List<TaxaCondominial> listarTodos() {
        Usuario loggedUser = (Usuario) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (loggedUser.getRole() == Usuario.Role.MORADOR) {
            if (loggedUser.getMorador() != null && loggedUser.getMorador().getUnidade() != null) {
                return taxaCondominialService.listarPorCondominio(loggedUser.getCondominio().getId())
                        .stream()
                        .filter(t -> t.getUnidade() != null && t.getUnidade().getId().equals(loggedUser.getMorador().getUnidade().getId()))
                        .toList();
            }
            return List.of();
        }
        if (loggedUser.getCondominio() != null) {
            return taxaCondominialService.listarPorCondominio(loggedUser.getCondominio().getId());
        }
        return taxaCondominialService.listarTodos();
    }

    @GetMapping("/{id}")
    public ResponseEntity<TaxaCondominial> buscarPorId(@PathVariable Long id) {
        Usuario loggedUser = (Usuario) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return taxaCondominialService.buscarPorId(id)
                .map(taxa -> {
                    if (loggedUser.getCondominio() != null && 
                        (taxa.getUnidade() == null || taxa.getUnidade().getBloco() == null || 
                         taxa.getUnidade().getBloco().getCondominio() == null || 
                         !taxa.getUnidade().getBloco().getCondominio().getId().equals(loggedUser.getCondominio().getId()))) {
                        return ResponseEntity.status(403).<TaxaCondominial>build();
                    }
                    if (loggedUser.getRole() == Usuario.Role.MORADOR && 
                        (taxa.getUnidade() == null || !taxa.getUnidade().getId().equals(loggedUser.getMorador().getUnidade().getId()))) {
                        return ResponseEntity.status(403).<TaxaCondominial>build();
                    }
                    return ResponseEntity.ok(taxa);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<TaxaCondominial> salvar(@RequestBody TaxaCondominial taxaCondominial) {
        Usuario loggedUser = (Usuario) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (loggedUser.getRole() == Usuario.Role.MORADOR) {
            return ResponseEntity.status(403).build();
        }
        if (loggedUser.getCondominio() != null) {
            if (taxaCondominial.getUnidade() == null || taxaCondominial.getUnidade().getId() == null) {
                return ResponseEntity.badRequest().build();
            }
            Optional<Unidade> unidadeOpt = unidadeService.buscarPorId(taxaCondominial.getUnidade().getId());
            if (unidadeOpt.isEmpty() || unidadeOpt.get().getBloco() == null || unidadeOpt.get().getBloco().getCondominio() == null ||
                !unidadeOpt.get().getBloco().getCondominio().getId().equals(loggedUser.getCondominio().getId())) {
                return ResponseEntity.status(403).build();
            }
        }
        return ResponseEntity.ok(taxaCondominialService.salvar(taxaCondominial));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        Usuario loggedUser = (Usuario) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (loggedUser.getRole() == Usuario.Role.MORADOR) {
            return ResponseEntity.status(403).build();
        }
        Optional<TaxaCondominial> taxaOpt = taxaCondominialService.buscarPorId(id);
        if (taxaOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        TaxaCondominial taxa = taxaOpt.get();
        if (loggedUser.getCondominio() != null && 
            (taxa.getUnidade() == null || taxa.getUnidade().getBloco() == null || 
             taxa.getUnidade().getBloco().getCondominio() == null || 
             !taxa.getUnidade().getBloco().getCondominio().getId().equals(loggedUser.getCondominio().getId()))) {
            return ResponseEntity.status(403).build();
        }
        taxaCondominialService.deletar(id);
        return ResponseEntity.noContent().build();
    }
}
