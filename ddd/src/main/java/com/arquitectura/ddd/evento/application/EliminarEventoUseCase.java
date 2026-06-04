package com.arquitectura.ddd.evento.application;

import com.arquitectura.ddd.evento.domain.Evento;
import com.arquitectura.ddd.evento.domain.EventoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class EliminarEventoUseCase {

    private final EventoRepository repository;

    public EliminarEventoUseCase(EventoRepository repository) {
        this.repository = repository;
    }

    @Transactional
    public void execute(Long id) {
        Evento evento = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Evento no encontrado"));
        repository.delete(evento);
    }
}
