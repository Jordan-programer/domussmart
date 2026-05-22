package com.domussmart.repository;

import com.domussmart.model.Reserva;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ReservaRepository extends JpaRepository<Reserva, Long> {
    List<Reserva> findByMoradorUnidadeBlocoCondominioId(Long condominioId);
    List<Reserva> findByMoradorId(Long moradorId);
}
