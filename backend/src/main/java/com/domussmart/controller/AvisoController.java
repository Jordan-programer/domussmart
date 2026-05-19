package com.domussmart.controller;

import com.domussmart.model.Aviso;
import com.domussmart.service.AvisoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/avisos")
public class AvisoController {

    @Autowired
    private AvisoService avisoService;

    @GetMapping
    public List<Aviso> listarTodos() {
        return avisoService.listarTodos();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Aviso> buscarPorId(@PathVariable Long id) {
        return avisoService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Aviso salvar(@RequestBody Aviso aviso) {
        return avisoService.salvar(aviso);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        avisoService.deletar(id);
        return ResponseEntity.noContent().build();
    }
}
