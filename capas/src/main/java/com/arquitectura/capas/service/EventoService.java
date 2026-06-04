package com.arquitectura.capas.service;

import com.arquitectura.capas.entity.Evento;
import com.arquitectura.capas.entity.Participante;
import java.util.List;

public interface EventoService {
    Evento crearEvento(Evento evento);
    List<Evento> listarEventos();
    Evento buscarEvento(Long id);
    void eliminarEvento(Long id);
    Evento inscribirParticipante(Long idEvento, Participante participante);
    List<Participante> listarParticipantes(Long idEvento);
}
