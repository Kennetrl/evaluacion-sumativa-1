package com.arquitectura.ddd.evento.application;

import com.arquitectura.ddd.evento.domain.Evento;
import com.arquitectura.ddd.evento.domain.EventoRepository;
import com.arquitectura.ddd.evento.domain.Participante;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class InscribirParticipanteUseCase {

    private final EventoRepository repository;

    public InscribirParticipanteUseCase(EventoRepository repository) {
        this.repository = repository;
    }

    @Transactional
    public Evento execute(Long idEvento, Participante participante) {
        Evento evento = repository.findById(idEvento)
                .orElseThrow(() -> new RuntimeException("Evento no encontrado"));

        evento.inscribirParticipante(participante);

        return repository.save(evento);
    }
}
