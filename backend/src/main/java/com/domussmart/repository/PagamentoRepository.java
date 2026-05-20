package com.domussmart.repository;

import com.domussmart.model.Pagamento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PagamentoRepository extends JpaRepository<Pagamento, Long> {
    List<Pagamento> findByTaxaCondominialUnidadeBlocoCondominioId(Long condominioId);
}
