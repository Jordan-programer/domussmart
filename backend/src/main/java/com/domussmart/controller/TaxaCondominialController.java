package com.domussmart.controller;

import com.domussmart.model.TaxaCondominial;
import com.domussmart.service.TaxaCondominialService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/taxas-condominiais")
public class TaxaCondominialController {

    @Autowired
    private TaxaCondominialService taxaCondominialService;

    @GetMapping
    public List<TaxaCondominial> listarTodos() {
        return taxaCondominialService.listarTodos();
    }

    @GetMapping("/{id}")
    public ResponseEntity<TaxaCondominial> buscarPorId(@PathVariable Long id) {
        return taxaCondominialService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public TaxaCondominial salvar(@RequestBody TaxaCondominial taxaCondominial) {
        return taxaCondominialService.salvar(taxaCondominial);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        taxaCondominialService.deletar(id);
        return ResponseEntity.noContent().build();
    }
}
