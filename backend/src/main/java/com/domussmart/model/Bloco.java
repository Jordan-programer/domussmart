package com.domussmart.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "blocos")
@Data
public class Bloco {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String nome; // Ex: Bloco A, Torre B

    @ManyToOne
    @JoinColumn(name = "condominio_id", nullable = false)
    private Condominio condominio;
}
