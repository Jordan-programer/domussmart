package com.domussmart.repository;

import com.domussmart.model.TaxaCondominial;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TaxaCondominialRepository extends JpaRepository<TaxaCondominial, Long> {
    List<TaxaCondominial> findByUnidadeBlocoCondominioId(Long condominioId);
    List<TaxaCondominial> findByUnidadeId(Long unidadeId);
}
