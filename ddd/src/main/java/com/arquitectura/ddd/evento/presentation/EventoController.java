package com.arquitectura.ddd.evento.presentation;

import com.arquitectura.ddd.evento.application.*;
import com.arquitectura.ddd.evento.domain.Evento;
import com.arquitectura.ddd.evento.domain.Participante;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/eventos")
public class EventoController {

    private final CrearEventoUseCase crearEventoUseCase;
    private final ListarEventosUseCase listarEventosUseCase;
    private final ObtenerEventoUseCase obtenerEventoUseCase;
    private final EliminarEventoUseCase eliminarEventoUseCase;
    private final InscribirParticipanteUseCase inscribirParticipanteUseCase;

    public EventoController(
            CrearEventoUseCase crearEventoUseCase,
            ListarEventosUseCase listarEventosUseCase,
            ObtenerEventoUseCase obtenerEventoUseCase,
            EliminarEventoUseCase eliminarEventoUseCase,
            InscribirParticipanteUseCase inscribirParticipanteUseCase) {
        this.crearEventoUseCase = crearEventoUseCase;
        this.listarEventosUseCase = listarEventosUseCase;
        this.obtenerEventoUseCase = obtenerEventoUseCase;
        this.eliminarEventoUseCase = eliminarEventoUseCase;
        this.inscribirParticipanteUseCase = inscribirParticipanteUseCase;
    }

    @PostMapping
    public Evento crearEvento(@RequestBody Evento evento) {
        return crearEventoUseCase.execute(evento);
    }

    @GetMapping
    public List<Evento> listarEventos() {
        return listarEventosUseCase.execute();
    }

    @GetMapping("/{id}")
    public Evento buscarEvento(@PathVariable Long id) {
        return obtenerEventoUseCase.execute(id);
    }

    @DeleteMapping("/{id}")
    public String eliminarEvento(@PathVariable Long id) {
        eliminarEventoUseCase.execute(id);
        return "Evento eliminado";
    }

    @PostMapping("/{idEvento}/participantes")
    public Evento inscribirParticipante(
            @PathVariable Long idEvento,
            @RequestBody Participante participante) {
        return inscribirParticipanteUseCase.execute(idEvento, participante);
    }

    @GetMapping("/{idEvento}/participantes")
    public List<Participante> listarParticipantes(@PathVariable Long idEvento) {
        Evento evento = obtenerEventoUseCase.execute(idEvento);
        return evento.getParticipantes();
    }
}
