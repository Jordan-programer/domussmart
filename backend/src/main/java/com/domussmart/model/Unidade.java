package com.domussmart.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "unidades")
@Data
public class Unidade {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String numero; // Ex: 101

    @ManyToOne
    @JoinColumn(name = "bloco_id", nullable = false)
    private Bloco bloco;

    private Integer vagas;
}
