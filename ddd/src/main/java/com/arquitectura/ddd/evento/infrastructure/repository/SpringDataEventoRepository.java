package com.arquitectura.ddd.evento.infrastructure.repository;

import com.arquitectura.ddd.evento.infrastructure.entity.EventoEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SpringDataEventoRepository extends JpaRepository<EventoEntity, Long> {
}
