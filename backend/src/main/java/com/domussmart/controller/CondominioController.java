package com.domussmart.controller;

import com.domussmart.model.Condominio;
import com.domussmart.service.CondominioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/condominios")
public class CondominioController {

    @Autowired
    private CondominioService condominioService;

    @GetMapping
    public List<Condominio> listarTodos() {
        return condominioService.listarTodos();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Condominio> buscarPorId(@PathVariable Long id) {
        return condominioService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Condominio salvar(@RequestBody Condominio condominio) {
        return condominioService.salvar(condominio);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        condominioService.deletar(id);
        return ResponseEntity.noContent().build();
    }
}
