package com.domussmart.controller;

import com.domussmart.model.Condominio;
import com.domussmart.model.Usuario;
import com.domussmart.service.CondominioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/condominios")
public class CondominioController {

    @Autowired
    private CondominioService condominioService;

    @GetMapping
    public List<Condominio> listarTodos() {
        Usuario loggedUser = (Usuario) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (loggedUser.getRole() != Usuario.Role.ADMIN) {
            if (loggedUser.getCondominio() != null) {
                return List.of(loggedUser.getCondominio());
            }
            return List.of();
        }
        return condominioService.listarTodos();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Condominio> buscarPorId(@PathVariable Long id) {
        Usuario loggedUser = (Usuario) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (loggedUser.getRole() != Usuario.Role.ADMIN) {
            if (loggedUser.getCondominio() == null || !loggedUser.getCondominio().getId().equals(id)) {
                return ResponseEntity.status(403).build();
            }
        }
        return condominioService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }


    @PostMapping
    public ResponseEntity<Condominio> salvar(@RequestBody Condominio condominio) {
        Usuario loggedUser = (Usuario) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (loggedUser.getRole() != Usuario.Role.ADMIN) {
            if (loggedUser.getRole() == Usuario.Role.SINDICO && 
                condominio.getId() != null && 
                loggedUser.getCondominio() != null && 
                loggedUser.getCondominio().getId().equals(condominio.getId())) {
                // Síndico can update their own condominio
                return ResponseEntity.ok(condominioService.salvar(condominio));
            }
            return ResponseEntity.status(403).build();
        }
        return ResponseEntity.ok(condominioService.salvar(condominio));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        Usuario loggedUser = (Usuario) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (loggedUser.getRole() != Usuario.Role.ADMIN) {
            return ResponseEntity.status(403).build();
        }
        condominioService.deletar(id);
        return ResponseEntity.noContent().build();
    }
}
