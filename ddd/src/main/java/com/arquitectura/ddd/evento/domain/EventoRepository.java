package com.arquitectura.ddd.evento.domain;

import java.util.List;
import java.util.Optional;

public interface EventoRepository {
    Evento save(Evento evento);
    List<Evento> findAll();
    Optional<Evento> findById(Long id);
    void delete(Evento evento);
}
