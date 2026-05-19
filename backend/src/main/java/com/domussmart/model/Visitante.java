package com.domussmart.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "visitantes")
@Data
public class Visitante {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nome;

    private String nif;

    @ManyToOne
    @JoinColumn(name = "unidade_id", nullable = false)
    private Unidade unidade; // Unidade que está visitando

    private LocalDateTime dataHoraEntrada;

    private LocalDateTime dataHoraSaida;

    @ManyToOne
    @JoinColumn(name = "registrado_por_id")
    private Usuario registradoPor; // Porteiro que registrou
}
