package com.domussmart.controller;

import com.domussmart.model.Despesa;
import com.domussmart.model.Usuario;
import com.domussmart.service.DespesaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/despesas")
public class DespesaController {

    @Autowired
    private DespesaService despesaService;

    @GetMapping
    public List<Despesa> listarTodos() {
        Usuario loggedUser = (Usuario) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (loggedUser.getCondominio() != null) {
            return despesaService.listarPorCondominio(loggedUser.getCondominio().getId());
        }
        return despesaService.listarTodos();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Despesa> buscarPorId(@PathVariable Long id) {
        Usuario loggedUser = (Usuario) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return despesaService.buscarPorId(id)
                .map(despesa -> {
                    if (loggedUser.getCondominio() != null && 
                        (despesa.getCondominio() == null || !despesa.getCondominio().getId().equals(loggedUser.getCondominio().getId()))) {
                        return ResponseEntity.status(403).<Despesa>build();
                    }
                    return ResponseEntity.ok(despesa);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Despesa> salvar(@RequestBody Despesa despesa) {
        Usuario loggedUser = (Usuario) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (loggedUser.getCondominio() != null) {
            despesa.setCondominio(loggedUser.getCondominio());
        }
        return ResponseEntity.ok(despesaService.salvar(despesa));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        Usuario loggedUser = (Usuario) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Optional<Despesa> despesaOpt = despesaService.buscarPorId(id);
        if (despesaOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Despesa despesa = despesaOpt.get();
        if (loggedUser.getCondominio() != null && 
            (despesa.getCondominio() == null || !despesa.getCondominio().getId().equals(loggedUser.getCondominio().getId()))) {
            return ResponseEntity.status(403).build();
        }
        despesaService.deletar(id);
        return ResponseEntity.noContent().build();
    }
}
