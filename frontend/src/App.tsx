import { useState, useEffect, useCallback, useRef } from 'react';
import * as api from './api';
import type { Evento, Participante } from './api';
import './App.css';

interface Toast {
  id: number;
  title: string;
  message: string;
  type: 'success' | 'error';
}

function getErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof Error && err.message) {
    return err.message;
  }
  return fallback;
}

function App() {
  const [events, setEvents] = useState<Evento[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedEvent, setSelectedEvent] = useState<Evento | null>(null);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [showRegisterModal, setShowRegisterModal] = useState<Evento | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastIdRef = useRef(0);

  const [createForm, setCreateForm] = useState({
    nombre: '',
    descripcion: '',
    fecha: '',
    lugar: '',
    capacidadMaxima: 10
  });

  const [registerForm, setRegisterForm] = useState({
    nombre: '',
    correo: '',
    carrera: ''
  });

  const [formError, setFormError] = useState<string | null>(null);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((title: string, message: string, type: 'success' | 'error' = 'success') => {
    toastIdRef.current += 1;
    const id = toastIdRef.current;
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  }, [removeToast]);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.listarEventos();
      setEvents(data);
    } catch (err: unknown) {
      showToast('Error de conexión', getErrorMessage(err, 'No se pudieron cargar los eventos.'), 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    let cancelled = false;

    async function loadEvents() {
      setLoading(true);
      try {
        const data = await api.listarEventos();
        if (!cancelled) {
          setEvents(data);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          showToast('Error de conexión', getErrorMessage(err, 'No se pudieron cargar los eventos.'), 'error');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadEvents();
    return () => {
      cancelled = true;
    };
  }, [showToast]);

  // --- Acciones de Eventos ---
  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Validaciones básicas del lado del cliente
    if (!createForm.nombre.trim()) {
      setFormError('El nombre del evento es obligatorio.');
      return;
    }
    if (!createForm.fecha) {
      setFormError('La fecha del evento es obligatoria.');
      return;
    }
    if (!createForm.lugar.trim()) {
      setFormError('El lugar del evento es obligatorio.');
      return;
    }
    if (createForm.capacidadMaxima <= 0) {
      setFormError('La capacidad máxima debe ser mayor a 0.');
      return;
    }

    try {
      const nuevoEvento = await api.crearEvento({
        nombre: createForm.nombre,
        descripcion: createForm.descripcion,
        fecha: createForm.fecha,
        lugar: createForm.lugar,
        capacidadMaxima: Number(createForm.capacidadMaxima)
      });

      showToast('Evento Creado', `El evento "${nuevoEvento.nombre}" ha sido registrado correctamente.`);
      setShowCreateModal(false);
      
      // Limpiar formulario
      setCreateForm({
        nombre: '',
        descripcion: '',
        fecha: '',
        lugar: '',
        capacidadMaxima: 10
      });

      // Recargar lista
      fetchEvents();
    } catch (err: unknown) {
      setFormError(getErrorMessage(err, 'Error al crear el evento.'));
    }
  };

  const handleDeleteEvent = async (id: number, nombre: string) => {
    if (!window.confirm(`¿Estás seguro de que deseas eliminar el evento "${nombre}"?`)) {
      return;
    }

    try {
      await api.eliminarEvento(id);
      showToast('Evento Eliminado', `El evento "${nombre}" ha sido eliminado.`);
      
      // Si el evento eliminado estaba seleccionado, lo deseleccionamos
      if (selectedEvent?.id === id) {
        setSelectedEvent(null);
      }
      
      fetchEvents();
    } catch (err: unknown) {
      showToast('Error al eliminar', getErrorMessage(err, 'No se pudo eliminar el evento.'), 'error');
    }
  };

  const handleRegisterParticipant = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!showRegisterModal || !showRegisterModal.id) return;

    // Validaciones básicas
    if (!registerForm.nombre.trim()) {
      setFormError('El nombre del participante es obligatorio.');
      return;
    }
    if (!registerForm.correo.trim()) {
      setFormError('El correo electrónico es obligatorio.');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(registerForm.correo)) {
      setFormError('Introduce un correo electrónico válido.');
      return;
    }
    if (!registerForm.carrera.trim()) {
      setFormError('La carrera es obligatoria.');
      return;
    }

    try {
      const eventoActualizado = await api.inscribirParticipante(showRegisterModal.id, {
        nombre: registerForm.nombre,
        correo: registerForm.correo,
        carrera: registerForm.carrera
      });

      showToast('Registro Exitoso', `¡Inscripción confirmada en "${eventoActualizado.nombre}"!`);
      setShowRegisterModal(null);
      
      // Limpiar formulario
      setRegisterForm({
        nombre: '',
        correo: '',
        carrera: ''
      });

      // Si tenemos este evento seleccionado, actualizamos su vista
      if (selectedEvent?.id === eventoActualizado.id) {
        setSelectedEvent(eventoActualizado);
      }

      fetchEvents();
    } catch (err: unknown) {
      setFormError(getErrorMessage(err, 'No se pudo registrar al participante.'));
    }
  };

  const handleViewDetails = async (evento: Evento) => {
    if (!evento.id) return;
    try {
      // Cargamos el evento de nuevo para asegurar que tenemos participantes frescos
      const fullEvent = await api.buscarEvento(evento.id);
      setSelectedEvent(fullEvent);
    } catch {
      showToast('Error', 'No se pudieron cargar los detalles del evento.', 'error');
      // Usar datos locales si el API falla por alguna razón
      setSelectedEvent(evento);
    }
  };

  // --- Filtros e Indicadores ---
  const filteredEvents = events.filter((e) => {
    const query = searchQuery.toLowerCase();
    return (
      e.nombre.toLowerCase().includes(query) ||
      e.lugar.toLowerCase().includes(query) ||
      (e.descripcion && e.descripcion.toLowerCase().includes(query))
    );
  });

  const totalEvents = events.length;
  
  const totalParticipants = events.reduce((sum, e) => {
    return sum + (e.participantes?.length || 0);
  }, 0);

  const totalCapacity = events.reduce((sum, e) => {
    return sum + e.capacidadMaxima;
  }, 0);

  const slotsAvailable = totalCapacity - totalParticipants;

  // --- Helpers Visuales ---
  const getProgressColorClass = (current: number, max: number) => {
    const ratio = current / max;
    if (ratio >= 0.9) return 'fill-danger';
    if (ratio >= 0.6) return 'fill-warning';
    return 'fill-safe';
  };

  const formatDate = (dateString: string) => {
    try {
      const [year, month, day] = dateString.split('-');
      const date = new Date(Number(year), Number(month) - 1, Number(day));
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="app-container">
      {/* HEADER */}
      <header className="app-header">
        <div className="brand-section">
          <div className="brand-logo" id="app-logo">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path>
              <line x1="4" y1="22" x2="4" y2="15"></line>
            </svg>
          </div>
          <h1 className="brand-title" id="app-title">Eventora</h1>
        </div>
        <button 
          id="btn-new-event"
          className="btn btn-primary animate-fade"
          onClick={() => {
            setFormError(null);
            setShowCreateModal(true);
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Crear Evento
        </button>
      </header>

      {/* METRIC CARDS */}
      <section className="metrics-grid animate-slide" id="metrics-panel">
        <div className="metric-card" id="metric-events">
          <div className="metric-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
          </div>
          <div className="metric-info">
            <span className="metric-value">{totalEvents}</span>
            <span className="metric-label">Eventos Activos</span>
          </div>
        </div>

        <div className="metric-card" id="metric-participants">
          <div className="metric-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          </div>
          <div className="metric-info">
            <span className="metric-value">{totalParticipants}</span>
            <span className="metric-label">Inscritos Totales</span>
          </div>
        </div>

        <div className="metric-card" id="metric-slots">
          <div className="metric-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </div>
          <div className="metric-info">
            <span className="metric-value">{slotsAvailable < 0 ? 0 : slotsAvailable}</span>
            <span className="metric-label">Cupos Disponibles</span>
          </div>
        </div>
      </section>

      {/* FILTER BAR */}
      <section className="filter-bar animate-fade" id="filters-panel">
        <div className="search-wrapper">
          <svg className="search-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            id="search-input"
            type="text"
            className="search-input"
            placeholder="Buscar eventos por nombre, lugar o descripción..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button 
          id="btn-refresh"
          className="btn btn-secondary"
          onClick={fetchEvents}
          title="Actualizar eventos"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 4 23 10 17 10"></polyline>
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
          </svg>
          Recargar
        </button>
      </section>

      {/* EVENTS GRID */}
      {loading ? (
        <div className="loading-container animate-fade" id="loading-state">
          <div className="spinner"></div>
          <p>Sincronizando con el servidor de eventos...</p>
        </div>
      ) : filteredEvents.length > 0 ? (
        <section className="events-grid animate-slide" id="events-list">
          {filteredEvents.map((evento) => {
            const count = evento.participantes?.length || 0;
            return (
              <div key={evento.id} className="event-card" id={`event-card-${evento.id}`}>
                <div className="event-card-header">
                  <h3 className="event-title">{evento.nombre}</h3>
                  <span className="event-date-badge">{formatDate(evento.fecha)}</span>
                </div>
                
                <p className="event-desc">{evento.descripcion || 'Sin descripción disponible.'}</p>
                
                <div className="event-details-meta">
                  <div className="meta-item">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                    <span>{evento.lugar}</span>
                  </div>
                </div>

                <div className="capacity-container">
                  <div className="capacity-label">
                    <span>Ocupación</span>
                    <span>{count} / {evento.capacidadMaxima}</span>
                  </div>
                  <div className="capacity-track">
                    <div 
                      className={`capacity-fill ${getProgressColorClass(count, evento.capacidadMaxima)}`}
                      style={{ width: `${Math.min((count / evento.capacidadMaxima) * 100, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="event-card-actions">
                  <button 
                    id={`btn-detail-${evento.id}`}
                    className="btn btn-secondary"
                    onClick={() => handleViewDetails(evento)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                    Detalles
                  </button>

                  <button 
                    id={`btn-register-${evento.id}`}
                    className="btn btn-success"
                    disabled={count >= evento.capacidadMaxima}
                    onClick={() => {
                      setFormError(null);
                      setShowRegisterModal(evento);
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                      <circle cx="9" cy="7" r="4"></circle>
                      <line x1="19" y1="8" x2="19" y2="14"></line>
                      <line x1="16" y1="11" x2="22" y2="11"></line>
                    </svg>
                    {count >= evento.capacidadMaxima ? 'Lleno' : 'Inscribir'}
                  </button>

                  <button 
                    id={`btn-delete-${evento.id}`}
                    className="btn btn-danger btn-icon-only"
                    onClick={() => evento.id && handleDeleteEvent(evento.id, evento.nombre)}
                    title="Eliminar Evento"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      <line x1="10" y1="11" x2="10" y2="17"></line>
                      <line x1="14" y1="11" x2="14" y2="17"></line>
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
        </section>
      ) : (
        <div className="empty-state animate-fade" id="empty-state">
          <div className="empty-state-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
          </div>
          <h3 className="empty-state-title">No hay eventos</h3>
          <p className="empty-state-msg">
            {searchQuery ? 'Ningún evento coincide con los términos de búsqueda.' : 'Aún no se han creado eventos. Registra el primero para comenzar.'}
          </p>
          {searchQuery && (
            <button className="btn btn-secondary" onClick={() => setSearchQuery('')}>
              Limpiar Búsqueda
            </button>
          )}
        </div>
      )}

      {/* --- MODAL: CREAR EVENTO --- */}
      {showCreateModal && (
        <div className="modal-overlay animate-fade" id="create-modal">
          <div className="modal-content animate-scale">
            <div className="modal-header">
              <h2 className="modal-title">Registrar Evento</h2>
              <button className="modal-close" onClick={() => setShowCreateModal(false)}>
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleCreateEvent}>
              <div className="modal-body">
                {formError && (
                  <div className="alert-banner alert-banner-error" style={{ marginBottom: '1.25rem' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="8" x2="12" y2="12"></line>
                      <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    <span>{formError}</span>
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label" htmlFor="nombre">Nombre del Evento *</label>
                  <input
                    id="nombre"
                    type="text"
                    className="form-input"
                    placeholder="Ej. Conferencia de Arquitectura de Software"
                    value={createForm.nombre}
                    onChange={(e) => setCreateForm({ ...createForm, nombre: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="descripcion">Descripción</label>
                  <textarea
                    id="descripcion"
                    className="form-textarea"
                    placeholder="Detalles adicionales sobre el contenido o ponentes..."
                    value={createForm.descripcion}
                    onChange={(e) => setCreateForm({ ...createForm, descripcion: e.target.value })}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label" htmlFor="fecha">Fecha *</label>
                    <input
                      id="fecha"
                      type="date"
                      className="form-input"
                      value={createForm.fecha}
                      onChange={(e) => setCreateForm({ ...createForm, fecha: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="capacidadMaxima">Capacidad Máxima *</label>
                    <input
                      id="capacidadMaxima"
                      type="number"
                      min="1"
                      className="form-input"
                      value={createForm.capacidadMaxima}
                      onChange={(e) => setCreateForm({ ...createForm, capacidadMaxima: Number(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="lugar">Lugar/Ubicación *</label>
                  <input
                    id="lugar"
                    type="text"
                    className="form-input"
                    placeholder="Ej. Auditorio Central o Enlace de Zoom"
                    value={createForm.lugar}
                    onChange={(e) => setCreateForm({ ...createForm, lugar: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" id="btn-submit-create">
                  Crear Evento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: INSCRIBIR PARTICIPANTE --- */}
      {showRegisterModal && (
        <div className="modal-overlay animate-fade" id="register-modal">
          <div className="modal-content animate-scale">
            <div className="modal-header">
              <h2 className="modal-title">Inscribir en Evento</h2>
              <button className="modal-close" onClick={() => setShowRegisterModal(null)}>
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleRegisterParticipant}>
              <div className="modal-body">
                <div style={{ marginBottom: '1.25rem', padding: '0.75rem', background: 'var(--accent-glow)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color-glow)' }}>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    Registrando participante para: <strong>{showRegisterModal.nombre}</strong>
                  </p>
                </div>

                {formError && (
                  <div className="alert-banner alert-banner-error" style={{ marginBottom: '1.25rem' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="8" x2="12" y2="12"></line>
                      <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    <span>{formError}</span>
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label" htmlFor="part-nombre">Nombre Completo *</label>
                  <input
                    id="part-nombre"
                    type="text"
                    className="form-input"
                    placeholder="Ej. Kennet Rodríguez"
                    value={registerForm.nombre}
                    onChange={(e) => setRegisterForm({ ...registerForm, nombre: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="part-correo">Correo Electrónico *</label>
                  <input
                    id="part-correo"
                    type="email"
                    className="form-input"
                    placeholder="Ej. kennet@universidad.edu"
                    value={registerForm.correo}
                    onChange={(e) => setRegisterForm({ ...registerForm, correo: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="part-carrera">Carrera / Programa de Estudio *</label>
                  <input
                    id="part-carrera"
                    type="text"
                    className="form-input"
                    placeholder="Ej. Ingeniería de Sistemas"
                    value={registerForm.carrera}
                    onChange={(e) => setRegisterForm({ ...registerForm, carrera: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowRegisterModal(null)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" id="btn-submit-register">
                  Confirmar Inscripción
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL DETALLE EVENTO / PARTICIPANTES --- */}
      {selectedEvent && (
        <div className="modal-overlay animate-fade" id="detail-modal">
          <div className="modal-content detail-modal-content animate-scale">
            <div className="event-detail-hero">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h2 className="detail-title">{selectedEvent.nombre}</h2>
                  <p className="detail-desc">{selectedEvent.descripcion || 'Sin descripción detallada disponible.'}</p>
                </div>
                <button className="modal-close" onClick={() => setSelectedEvent(null)}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>

              <div className="detail-meta-grid">
                <div className="meta-item">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                  <span>Fecha: {formatDate(selectedEvent.fecha)}</span>
                </div>
                <div className="meta-item">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                  <span>Lugar: {selectedEvent.lugar}</span>
                </div>
                <div className="meta-item">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                  </svg>
                  <span>Capacidad: {selectedEvent.participantes?.length || 0} / {selectedEvent.capacidadMaxima}</span>
                </div>
              </div>
            </div>

            <div className="participant-section">
              <div className="section-title-wrapper">
                <h3 className="section-title">Participantes Inscritos</h3>
                <button 
                  id="btn-register-detail"
                  className="btn btn-success btn-primary"
                  style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', boxShadow: 'none' }}
                  disabled={(selectedEvent.participantes?.length || 0) >= selectedEvent.capacidadMaxima}
                  onClick={() => {
                    setFormError(null);
                    setShowRegisterModal(selectedEvent);
                  }}
                >
                  + Inscribir
                </button>
              </div>

              {selectedEvent.participantes && selectedEvent.participantes.length > 0 ? (
                <div className="table-wrapper">
                  <table className="participant-table" id="participants-table">
                    <thead>
                      <tr>
                        <th>Nombre</th>
                        <th>Correo</th>
                        <th>Carrera</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedEvent.participantes.map((part: Participante) => (
                        <tr key={part.id}>
                          <td>{part.nombre}</td>
                          <td>{part.correo}</td>
                          <td>{part.carrera}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="no-participants-msg">
                  No hay participantes inscritos en este evento todavía.
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setSelectedEvent(null)}>
                Cerrar Ventana
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST SYSTEM CONTAINER */}
      <div className="toast-container" id="toasts-wrapper">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast toast-${toast.type}`} id={`toast-${toast.id}`}>
            <div className="toast-content">
              <h4 className="toast-title">{toast.title}</h4>
              <p className="toast-message">{toast.message}</p>
            </div>
            <button className="toast-close" onClick={() => removeToast(toast.id)}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
