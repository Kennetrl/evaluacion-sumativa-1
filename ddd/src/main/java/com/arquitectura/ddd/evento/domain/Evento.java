package com.arquitectura.ddd.evento.domain;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public class Evento {

    private Long id;
    private String nombre;
    private String descripcion;
    private LocalDate fecha;
    private String lugar;
    private Integer capacidadMaxima;
    private List<Participante> participantes = new ArrayList<>();

    public Evento() {
    }

    public Evento(Long id, String nombre, String descripcion, LocalDate fecha, String lugar, Integer capacidadMaxima, List<Participante> participantes) {
        this.id = id;
        this.descripcion = descripcion;
        this.fecha = fecha;
        this.lugar = lugar;
        this.participantes = participantes != null ? participantes : new ArrayList<>();
        setNombre(nombre);
        setCapacidadMaxima(capacidadMaxima);
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        if (nombre == null || nombre.isBlank()) {
            throw new RuntimeException("El nombre es obligatorio");
        }
        this.nombre = nombre;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public LocalDate getFecha() {
        return fecha;
    }

    public void setFecha(LocalDate fecha) {
        this.fecha = fecha;
    }

    public String getLugar() {
        return lugar;
    }

    public void setLugar(String lugar) {
        this.lugar = lugar;
    }

    public Integer getCapacidadMaxima() {
        return capacidadMaxima;
    }

    public void setCapacidadMaxima(Integer capacidadMaxima) {
        if (capacidadMaxima == null || capacidadMaxima <= 0) {
            throw new RuntimeException("La capacidad debe ser mayor a cero");
        }
        this.capacidadMaxima = capacidadMaxima;
    }

    public List<Participante> getParticipantes() {
        return participantes;
    }

    public void setParticipantes(List<Participante> participantes) {
        this.participantes = participantes != null ? participantes : new ArrayList<>();
    }

    public void inscribirParticipante(Participante participante) {
        if (this.participantes.size() >= this.capacidadMaxima) {
            throw new RuntimeException("No existen cupos disponibles");
        }
        this.participantes.add(participante);
    }
}
