package com.domussmart.repository;

import com.domussmart.model.Visitante;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface VisitanteRepository extends JpaRepository<Visitante, Long> {
    List<Visitante> findByUnidadeBlocoCondominioId(Long condominioId);
    List<Visitante> findByUnidadeId(Long unidadeId);
    List<Visitante> findByRegistradoPorId(Long registradoPorId);
}
