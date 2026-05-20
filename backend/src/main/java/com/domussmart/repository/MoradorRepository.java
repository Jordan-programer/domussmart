package com.domussmart.repository;

import com.domussmart.model.Morador;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

import java.util.Optional;

@Repository
public interface MoradorRepository extends JpaRepository<Morador, Long> {
    List<Morador> findByUnidadeBlocoCondominioId(Long condominioId);
    Optional<Morador> findByEmail(String email);
    Optional<Morador> findByEmailAndNif(String email, String nif);
}
