package com.arquitectura.ddd.evento.infrastructure.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "eventos")
public class EventoEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombre;
    private String descripcion;
    private LocalDate fecha;
    private String lugar;
    private Integer capacidadMaxima;

    @OneToMany(cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    private List<ParticipanteEntity> participantes = new ArrayList<>();

    public EventoEntity() {
    }

    public EventoEntity(Long id, String nombre, String descripcion, LocalDate fecha, String lugar, Integer capacidadMaxima, List<ParticipanteEntity> participantes) {
        this.id = id;
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.fecha = fecha;
        this.lugar = lugar;
        this.capacidadMaxima = capacidadMaxima;
        this.participantes = participantes != null ? participantes : new ArrayList<>();
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
        this.capacidadMaxima = capacidadMaxima;
    }

    public List<ParticipanteEntity> getParticipantes() {
        return participantes;
    }

    public void setParticipantes(List<ParticipanteEntity> participantes) {
        this.participantes = participantes != null ? participantes : new ArrayList<>();
    }
}
