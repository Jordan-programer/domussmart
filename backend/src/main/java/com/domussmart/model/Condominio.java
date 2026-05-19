package com.domussmart.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "condominios")
@Data
public class Condominio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nome;

    @Column(unique = true)
    private String nif;

    private String endereco;
}
