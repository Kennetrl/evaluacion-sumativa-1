package com.arquitectura.ddd.evento.infrastructure.entity;

import com.arquitectura.ddd.evento.domain.Evento;
import com.arquitectura.ddd.evento.domain.Participante;

import java.util.List;
import java.util.stream.Collectors;

public class EventoMapper {

    public static Evento toDomain(EventoEntity entity) {
        if (entity == null) {
            return null;
        }
        List<Participante> domainParticipantes = entity.getParticipantes().stream()
                .map(EventoMapper::toDomain)
                .collect(Collectors.toList());

        return new Evento(
                entity.getId(),
                entity.getNombre(),
                entity.getDescripcion(),
                entity.getFecha(),
                entity.getLugar(),
                entity.getCapacidadMaxima(),
                domainParticipantes
        );
    }

    public static EventoEntity toEntity(Evento domain) {
        if (domain == null) {
            return null;
        }
        List<ParticipanteEntity> entityParticipantes = domain.getParticipantes().stream()
                .map(EventoMapper::toEntity)
                .collect(Collectors.toList());

        return new EventoEntity(
                domain.getId(),
                domain.getNombre(),
                domain.getDescripcion(),
                domain.getFecha(),
                domain.getLugar(),
                domain.getCapacidadMaxima(),
                entityParticipantes
        );
    }

    public static Participante toDomain(ParticipanteEntity entity) {
        if (entity == null) {
            return null;
        }
        return new Participante(
                entity.getId(),
                entity.getNombre(),
                entity.getCorreo(),
                entity.getCarrera()
        );
    }

    public static ParticipanteEntity toEntity(Participante domain) {
        if (domain == null) {
            return null;
        }
        return new ParticipanteEntity(
                domain.getId(),
                domain.getNombre(),
                domain.getCorreo(),
                domain.getCarrera()
        );
    }
}
