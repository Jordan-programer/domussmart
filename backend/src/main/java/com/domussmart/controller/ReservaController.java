package com.domussmart.controller;

import com.domussmart.model.Morador;
import com.domussmart.model.Reserva;
import com.domussmart.model.Usuario;
import com.domussmart.service.MoradorService;
import com.domussmart.service.ReservaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/reservas")
public class ReservaController {

    @Autowired
    private ReservaService reservaService;

    @Autowired
    private MoradorService moradorService;

    @GetMapping
    public List<Reserva> listarTodos() {
        Usuario loggedUser = (Usuario) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (loggedUser.getRole() == Usuario.Role.MORADOR) {
            if (loggedUser.getMorador() != null) {
                return reservaService.listarPorCondominio(loggedUser.getCondominio().getId())
                        .stream()
                        .filter(r -> r.getMorador() != null && r.getMorador().getId().equals(loggedUser.getMorador().getId()))
                        .toList();
            }
            return List.of();
        }
        if (loggedUser.getCondominio() != null) {
            return reservaService.listarPorCondominio(loggedUser.getCondominio().getId());
        }
        return reservaService.listarTodos();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Reserva> buscarPorId(@PathVariable Long id) {
        Usuario loggedUser = (Usuario) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return reservaService.buscarPorId(id)
                .map(reserva -> {
                    if (loggedUser.getCondominio() != null && 
                        (reserva.getMorador() == null || reserva.getMorador().getUnidade() == null || 
                         reserva.getMorador().getUnidade().getBloco() == null || 
                         reserva.getMorador().getUnidade().getBloco().getCondominio() == null || 
                         !reserva.getMorador().getUnidade().getBloco().getCondominio().getId().equals(loggedUser.getCondominio().getId()))) {
                        return ResponseEntity.status(403).<Reserva>build();
                    }
                    if (loggedUser.getRole() == Usuario.Role.MORADOR && 
                        (reserva.getMorador() == null || !reserva.getMorador().getId().equals(loggedUser.getMorador().getId()))) {
                        return ResponseEntity.status(403).<Reserva>build();
                    }
                    return ResponseEntity.ok(reserva);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Reserva> salvar(@RequestBody Reserva reserva) {
        Usuario loggedUser = (Usuario) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (loggedUser.getRole() == Usuario.Role.MORADOR) {
            if (loggedUser.getMorador() == null || reserva.getMorador() == null || 
                !reserva.getMorador().getId().equals(loggedUser.getMorador().getId())) {
                return ResponseEntity.status(403).build();
            }
        }
        if (loggedUser.getCondominio() != null) {
            if (reserva.getMorador() == null || reserva.getMorador().getId() == null) {
                return ResponseEntity.badRequest().build();
            }
            Optional<Morador> moradorOpt = moradorService.buscarPorId(reserva.getMorador().getId());
            if (moradorOpt.isEmpty() || moradorOpt.get().getUnidade() == null || moradorOpt.get().getUnidade().getBloco() == null ||
                moradorOpt.get().getUnidade().getBloco().getCondominio() == null ||
                !moradorOpt.get().getUnidade().getBloco().getCondominio().getId().equals(loggedUser.getCondominio().getId())) {
                return ResponseEntity.status(403).build();
            }
        }
        return ResponseEntity.ok(reservaService.salvar(reserva));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        Usuario loggedUser = (Usuario) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Optional<Reserva> reservaOpt = reservaService.buscarPorId(id);
        if (reservaOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Reserva reserva = reservaOpt.get();
        if (loggedUser.getCondominio() != null && 
            (reserva.getMorador() == null || reserva.getMorador().getUnidade() == null || 
             reserva.getMorador().getUnidade().getBloco() == null || 
             reserva.getMorador().getUnidade().getBloco().getCondominio() == null || 
             !reserva.getMorador().getUnidade().getBloco().getCondominio().getId().equals(loggedUser.getCondominio().getId()))) {
            return ResponseEntity.status(403).build();
        }
        if (loggedUser.getRole() == Usuario.Role.MORADOR && 
            (reserva.getMorador() == null || !reserva.getMorador().getId().equals(loggedUser.getMorador().getId()))) {
            return ResponseEntity.status(403).build();
        }
        reservaService.deletar(id);
        return ResponseEntity.noContent().build();
    }
}
