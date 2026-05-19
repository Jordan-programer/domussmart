package com.domussmart.model;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "pagamentos")
@Data
public class Pagamento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "taxa_condominial_id", nullable = false)
    private TaxaCondominial taxaCondominial;

    @Column(nullable = false)
    private BigDecimal valorPago;

    @Column(nullable = false)
    private LocalDateTime dataPagamento = LocalDateTime.now();

    private String formaPagamento; // PIX, BOLETO, CARTAO
}
