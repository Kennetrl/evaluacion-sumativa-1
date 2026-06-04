package com.arquitectura.capas.service;

import com.arquitectura.capas.entity.Evento;
import com.arquitectura.capas.entity.Participante;
import com.arquitectura.capas.repository.EventoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class EventoServiceImpl implements EventoService {

    private final EventoRepository repository;

    public EventoServiceImpl(EventoRepository repository) {
        this.repository = repository;
    }

    @Override
    public Evento crearEvento(Evento evento) {
        if (evento.getNombre() == null || evento.getNombre().isBlank()) {
            throw new RuntimeException("El nombre es obligatorio");
        }

        if (evento.getCapacidadMaxima() == null || evento.getCapacidadMaxima() <= 0) {
            throw new RuntimeException("La capacidad debe ser mayor a cero");
        }

        return repository.save(evento);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Evento> listarEventos() {
        return repository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public Evento buscarEvento(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Evento no encontrado"));
    }

    @Override
    public void eliminarEvento(Long id) {
        Evento evento = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Evento no encontrado"));

        repository.delete(evento);
    }

    @Override
    public Evento inscribirParticipante(Long idEvento, Participante participante) {
        Evento evento = repository.findById(idEvento)
                .orElseThrow(() -> new RuntimeException("Evento no encontrado"));

        if (evento.getParticipantes().size() >= evento.getCapacidadMaxima()) {
            throw new RuntimeException("No existen cupos disponibles");
        }

        evento.getParticipantes().add(participante);

        return repository.save(evento);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Participante> listarParticipantes(Long idEvento) {
        Evento evento = repository.findById(idEvento)
                .orElseThrow(() -> new RuntimeException("Evento no encontrado"));

        return evento.getParticipantes();
    }
}
