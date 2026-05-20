package com.domussmart.controller;

import com.domussmart.model.Chamado;
import com.domussmart.model.Unidade;
import com.domussmart.model.Usuario;
import com.domussmart.service.ChamadoService;
import com.domussmart.service.UnidadeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/chamados")
public class ChamadoController {

    @Autowired
    private ChamadoService chamadoService;

    @Autowired
    private UnidadeService unidadeService;

    @GetMapping
    public List<Chamado> listarTodos() {
        Usuario loggedUser = (Usuario) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (loggedUser.getRole() == Usuario.Role.MORADOR) {
            if (loggedUser.getMorador() != null && loggedUser.getMorador().getUnidade() != null) {
                return chamadoService.listarPorCondominio(loggedUser.getCondominio().getId())
                        .stream()
                        .filter(c -> c.getUnidade() != null && c.getUnidade().getId().equals(loggedUser.getMorador().getUnidade().getId()))
                        .toList();
            }
            return List.of();
        }
        if (loggedUser.getCondominio() != null) {
            return chamadoService.listarPorCondominio(loggedUser.getCondominio().getId());
        }
        return chamadoService.listarTodos();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Chamado> buscarPorId(@PathVariable Long id) {
        Usuario loggedUser = (Usuario) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return chamadoService.buscarPorId(id)
                .map(chamado -> {
                    if (loggedUser.getCondominio() != null && 
                        (chamado.getUnidade() == null || chamado.getUnidade().getBloco() == null || 
                         chamado.getUnidade().getBloco().getCondominio() == null || 
                         !chamado.getUnidade().getBloco().getCondominio().getId().equals(loggedUser.getCondominio().getId()))) {
                        return ResponseEntity.status(403).<Chamado>build();
                    }
                    if (loggedUser.getRole() == Usuario.Role.MORADOR && 
                        (chamado.getUnidade() == null || !chamado.getUnidade().getId().equals(loggedUser.getMorador().getUnidade().getId()))) {
                        return ResponseEntity.status(403).<Chamado>build();
                    }
                    return ResponseEntity.ok(chamado);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Chamado> salvar(@RequestBody Chamado chamado) {
        Usuario loggedUser = (Usuario) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (loggedUser.getRole() == Usuario.Role.MORADOR) {
            if (loggedUser.getMorador() == null || loggedUser.getMorador().getUnidade() == null || 
                chamado.getUnidade() == null || !chamado.getUnidade().getId().equals(loggedUser.getMorador().getUnidade().getId())) {
                return ResponseEntity.status(403).build();
            }
        }
        if (loggedUser.getCondominio() != null) {
            if (chamado.getUnidade() == null || chamado.getUnidade().getId() == null) {
                return ResponseEntity.badRequest().build();
            }
            Optional<Unidade> unidadeOpt = unidadeService.buscarPorId(chamado.getUnidade().getId());
            if (unidadeOpt.isEmpty() || unidadeOpt.get().getBloco() == null || unidadeOpt.get().getBloco().getCondominio() == null ||
                !unidadeOpt.get().getBloco().getCondominio().getId().equals(loggedUser.getCondominio().getId())) {
                return ResponseEntity.status(403).build();
            }
        }
        return ResponseEntity.ok(chamadoService.salvar(chamado));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        Usuario loggedUser = (Usuario) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Optional<Chamado> chamadoOpt = chamadoService.buscarPorId(id);
        if (chamadoOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Chamado chamado = chamadoOpt.get();
        if (loggedUser.getCondominio() != null && 
            (chamado.getUnidade() == null || chamado.getUnidade().getBloco() == null || 
             chamado.getUnidade().getBloco().getCondominio() == null || 
             !chamado.getUnidade().getBloco().getCondominio().getId().equals(loggedUser.getCondominio().getId()))) {
            return ResponseEntity.status(403).build();
        }
        if (loggedUser.getRole() == Usuario.Role.MORADOR && 
            (chamado.getUnidade() == null || !chamado.getUnidade().getId().equals(loggedUser.getMorador().getUnidade().getId()))) {
            return ResponseEntity.status(403).build();
        }
        chamadoService.deletar(id);
        return ResponseEntity.noContent().build();
    }
}
