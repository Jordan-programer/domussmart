package com.domussmart.repository;

import com.domussmart.model.TaxaCondominial;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TaxaCondominialRepository extends JpaRepository<TaxaCondominial, Long> {
}
