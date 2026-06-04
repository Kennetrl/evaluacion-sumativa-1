package com.arquitectura.ddd.evento.application;

import com.arquitectura.ddd.evento.domain.Evento;
import com.arquitectura.ddd.evento.domain.EventoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CrearEventoUseCase {

    private final EventoRepository repository;

    public CrearEventoUseCase(EventoRepository repository) {
        this.repository = repository;
    }

    @Transactional
    public Evento execute(Evento evento) {
        // Re-enforce validation logic before saving
        if (evento.getNombre() == null || evento.getNombre().isBlank()) {
            throw new RuntimeException("El nombre es obligatorio");
        }
        if (evento.getCapacidadMaxima() == null || evento.getCapacidadMaxima() <= 0) {
            throw new RuntimeException("La capacidad debe ser mayor a cero");
        }
        return repository.save(evento);
    }
}
