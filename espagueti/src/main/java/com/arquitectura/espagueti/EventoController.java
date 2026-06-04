package com.arquitectura.espagueti;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/eventos")
public class EventoController {

    private final EventoRepository repository;

    public EventoController(EventoRepository repository) {
        this.repository = repository;
    }

    @PostMapping
    public Evento crearEvento(@RequestBody Evento evento) {

        if (evento.getNombre() == null || evento.getNombre().isBlank()) {
            throw new RuntimeException("El nombre es obligatorio");
        }

        if (evento.getCapacidadMaxima() <= 0) {
            throw new RuntimeException("La capacidad debe ser mayor a cero");
        }

        return repository.save(evento);
    }

    @GetMapping
    public List<Evento> listarEventos() {
        return repository.findAll();
    }

    @GetMapping("/{id}")
    public Evento buscarEvento(@PathVariable Long id) {

        Evento evento = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Evento no encontrado"));

        return evento;
    }

    @DeleteMapping("/{id}")
    public String eliminarEvento(@PathVariable Long id) {

        Evento evento = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Evento no encontrado"));

        repository.delete(evento);

        return "Evento eliminado";
    }

    @PostMapping("/{idEvento}/participantes")
    public Evento inscribirParticipante(
            @PathVariable Long idEvento,
            @RequestBody Participante participante) {

        Evento evento = repository.findById(idEvento)
                .orElseThrow(() -> new RuntimeException("Evento no encontrado"));

        if (evento.getParticipantes().size() >= evento.getCapacidadMaxima()) {
            throw new RuntimeException("No existen cupos disponibles");
        }

        evento.getParticipantes().add(participante);

        return repository.save(evento);
    }

    @GetMapping("/{idEvento}/participantes")
    public List<Participante> listarParticipantes(@PathVariable Long idEvento) {

        Evento evento = repository.findById(idEvento)
                .orElseThrow(() -> new RuntimeException("Evento no encontrado"));

        return evento.getParticipantes();
    }
}