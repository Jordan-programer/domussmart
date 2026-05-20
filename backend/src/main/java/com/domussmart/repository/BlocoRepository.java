package com.domussmart.repository;

import com.domussmart.model.Bloco;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface BlocoRepository extends JpaRepository<Bloco, Long> {
    List<Bloco> findByCondominioId(Long condominioId);
}
