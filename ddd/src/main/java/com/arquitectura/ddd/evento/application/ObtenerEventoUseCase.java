package com.arquitectura.ddd.evento.application;

import com.arquitectura.ddd.evento.domain.Evento;
import com.arquitectura.ddd.evento.domain.EventoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ObtenerEventoUseCase {

    private final EventoRepository repository;

    public ObtenerEventoUseCase(EventoRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public Evento execute(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Evento no encontrado"));
    }
}
