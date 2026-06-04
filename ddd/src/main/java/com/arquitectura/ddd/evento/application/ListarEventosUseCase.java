package com.arquitectura.ddd.evento.application;

import com.arquitectura.ddd.evento.domain.Evento;
import com.arquitectura.ddd.evento.domain.EventoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ListarEventosUseCase {

    private final EventoRepository repository;

    public ListarEventosUseCase(EventoRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public List<Evento> execute() {
        return repository.findAll();
    }
}
