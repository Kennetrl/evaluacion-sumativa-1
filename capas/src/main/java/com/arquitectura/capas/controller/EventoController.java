package com.arquitectura.capas.controller;

import com.arquitectura.capas.entity.Evento;
import com.arquitectura.capas.entity.Participante;
import com.arquitectura.capas.service.EventoService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/eventos")
public class EventoController {

    private final EventoService service;

    public EventoController(EventoService service) {
        this.service = service;
    }

    @PostMapping
    public Evento crearEvento(@RequestBody Evento evento) {
        return service.crearEvento(evento);
    }

    @GetMapping
    public List<Evento> listarEventos() {
        return service.listarEventos();
    }

    @GetMapping("/{id}")
    public Evento buscarEvento(@PathVariable Long id) {
        return service.buscarEvento(id);
    }

    @DeleteMapping("/{id}")
    public String eliminarEvento(@PathVariable Long id) {
        service.eliminarEvento(id);
        return "Evento eliminado";
    }

    @PostMapping("/{idEvento}/participantes")
    public Evento inscribirParticipante(
            @PathVariable Long idEvento,
            @RequestBody Participante participante) {
        return service.inscribirParticipante(idEvento, participante);
    }

    @GetMapping("/{idEvento}/participantes")
    public List<Participante> listarParticipantes(@PathVariable Long idEvento) {
        return service.listarParticipantes(idEvento);
    }
}
