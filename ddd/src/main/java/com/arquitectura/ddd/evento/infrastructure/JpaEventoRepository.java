package com.arquitectura.ddd.evento.infrastructure;

import com.arquitectura.ddd.evento.domain.Evento;
import com.arquitectura.ddd.evento.domain.EventoRepository;
import com.arquitectura.ddd.evento.infrastructure.entity.EventoEntity;
import com.arquitectura.ddd.evento.infrastructure.entity.EventoMapper;
import com.arquitectura.ddd.evento.infrastructure.repository.SpringDataEventoRepository;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Component
public class JpaEventoRepository implements EventoRepository {

    private final SpringDataEventoRepository springDataRepository;

    public JpaEventoRepository(SpringDataEventoRepository springDataRepository) {
        this.springDataRepository = springDataRepository;
    }

    @Override
    public Evento save(Evento evento) {
        EventoEntity entity = EventoMapper.toEntity(evento);
        EventoEntity savedEntity = springDataRepository.save(entity);
        return EventoMapper.toDomain(savedEntity);
    }

    @Override
    public List<Evento> findAll() {
        return springDataRepository.findAll().stream()
                .map(EventoMapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public Optional<Evento> findById(Long id) {
        return springDataRepository.findById(id)
                .map(EventoMapper::toDomain);
    }

    @Override
    public void delete(Evento evento) {
        if (evento.getId() != null) {
            springDataRepository.deleteById(evento.getId());
        }
    }
}
