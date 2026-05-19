package com.domussmart.controller;

import com.domussmart.model.Bloco;
import com.domussmart.service.BlocoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/blocos")
public class BlocoController {

    @Autowired
    private BlocoService blocoService;

    @GetMapping
    public List<Bloco> listarTodos() {
        return blocoService.listarTodos();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Bloco> buscarPorId(@PathVariable Long id) {
        return blocoService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Bloco salvar(@RequestBody Bloco bloco) {
        return blocoService.salvar(bloco);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        blocoService.deletar(id);
        return ResponseEntity.noContent().build();
    }
}
