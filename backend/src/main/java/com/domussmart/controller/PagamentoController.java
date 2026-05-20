package com.domussmart.controller;

import com.domussmart.model.Pagamento;
import com.domussmart.model.TaxaCondominial;
import com.domussmart.model.Usuario;
import com.domussmart.service.PagamentoService;
import com.domussmart.service.TaxaCondominialService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/pagamentos")
public class PagamentoController {

    @Autowired
    private PagamentoService pagamentoService;

    @Autowired
    private TaxaCondominialService taxaCondominialService;

    @GetMapping
    public List<Pagamento> listarTodos() {
        Usuario loggedUser = (Usuario) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (loggedUser.getRole() == Usuario.Role.MORADOR) {
            if (loggedUser.getMorador() != null && loggedUser.getMorador().getUnidade() != null) {
                return pagamentoService.listarPorCondominio(loggedUser.getCondominio().getId())
                        .stream()
                        .filter(p -> p.getTaxaCondominial() != null && p.getTaxaCondominial().getUnidade() != null && 
                                     p.getTaxaCondominial().getUnidade().getId().equals(loggedUser.getMorador().getUnidade().getId()))
                        .toList();
            }
            return List.of();
        }
        if (loggedUser.getCondominio() != null) {
            return pagamentoService.listarPorCondominio(loggedUser.getCondominio().getId());
        }
        return pagamentoService.listarTodos();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Pagamento> buscarPorId(@PathVariable Long id) {
        Usuario loggedUser = (Usuario) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return pagamentoService.buscarPorId(id)
                .map(pagamento -> {
                    if (loggedUser.getCondominio() != null && 
                        (pagamento.getTaxaCondominial() == null || pagamento.getTaxaCondominial().getUnidade() == null || 
                         pagamento.getTaxaCondominial().getUnidade().getBloco() == null || 
                         pagamento.getTaxaCondominial().getUnidade().getBloco().getCondominio() == null || 
                         !pagamento.getTaxaCondominial().getUnidade().getBloco().getCondominio().getId().equals(loggedUser.getCondominio().getId()))) {
                        return ResponseEntity.status(403).<Pagamento>build();
                    }
                    if (loggedUser.getRole() == Usuario.Role.MORADOR && 
                        (pagamento.getTaxaCondominial() == null || pagamento.getTaxaCondominial().getUnidade() == null || 
                         !pagamento.getTaxaCondominial().getUnidade().getId().equals(loggedUser.getMorador().getUnidade().getId()))) {
                        return ResponseEntity.status(403).<Pagamento>build();
                    }
                    return ResponseEntity.ok(pagamento);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Pagamento> salvar(@RequestBody Pagamento pagamento) {
        Usuario loggedUser = (Usuario) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (loggedUser.getRole() == Usuario.Role.MORADOR) {
            if (pagamento.getTaxaCondominial() == null || pagamento.getTaxaCondominial().getId() == null) {
                return ResponseEntity.badRequest().build();
            }
            Optional<TaxaCondominial> taxaOpt = taxaCondominialService.buscarPorId(pagamento.getTaxaCondominial().getId());
            if (taxaOpt.isEmpty() || taxaOpt.get().getUnidade() == null || 
                !taxaOpt.get().getUnidade().getId().equals(loggedUser.getMorador().getUnidade().getId())) {
                return ResponseEntity.status(403).build();
            }
        }
        Optional<TaxaCondominial> taxaOpt = taxaCondominialService.buscarPorId(pagamento.getTaxaCondominial().getId());
        if (taxaOpt.isPresent()) {
            TaxaCondominial taxa = taxaOpt.get();
            taxa.setPaga(true);
            taxaCondominialService.salvar(taxa);
            pagamento.setTaxaCondominial(taxa);
        }
        return ResponseEntity.ok(pagamentoService.salvar(pagamento));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        Usuario loggedUser = (Usuario) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (loggedUser.getRole() == Usuario.Role.MORADOR) {
            return ResponseEntity.status(403).build();
        }
        Optional<Pagamento> pagamentoOpt = pagamentoService.buscarPorId(id);
        if (pagamentoOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Pagamento pagamento = pagamentoOpt.get();
        if (loggedUser.getCondominio() != null && 
            (pagamento.getTaxaCondominial() == null || pagamento.getTaxaCondominial().getUnidade() == null || 
             pagamento.getTaxaCondominial().getUnidade().getBloco() == null || 
             pagamento.getTaxaCondominial().getUnidade().getBloco().getCondominio() == null || 
             !pagamento.getTaxaCondominial().getUnidade().getBloco().getCondominio().getId().equals(loggedUser.getCondominio().getId()))) {
            return ResponseEntity.status(403).build();
        }
        pagamentoService.deletar(id);
        return ResponseEntity.noContent().build();
    }
}
