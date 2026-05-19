package com.domussmart.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "moradores")
@Data
public class Morador {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nome;

    @Column(unique = true)
    private String nif;

    private String telefone;

    private String email;

    @Enumerated(EnumType.STRING)
    private TipoMorador tipo; // PROPRIETARIO, INQUILINO

    @ManyToOne
    @JoinColumn(name = "unidade_id")
    private Unidade unidade; // Unidade onde vive

    public enum TipoMorador {
        PROPRIETARIO, INQUILINO
    }
}
