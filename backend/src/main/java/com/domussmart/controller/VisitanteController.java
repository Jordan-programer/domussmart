package com.domussmart.controller;

import com.domussmart.model.Visitante;
import com.domussmart.service.VisitanteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/visitantes")
public class VisitanteController {

    @Autowired
    private VisitanteService visitanteService;

    @GetMapping
    public List<Visitante> listarTodos() {
        return visitanteService.listarTodos();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Visitante> buscarPorId(@PathVariable Long id) {
        return visitanteService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Visitante salvar(@RequestBody Visitante visitante) {
        return visitanteService.salvar(visitante);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        visitanteService.deletar(id);
        return ResponseEntity.noContent().build();
    }
}
