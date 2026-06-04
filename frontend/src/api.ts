export interface Participante {
  id?: number;
  nombre: string;
  correo: string;
  carrera: string;
}

export interface Evento {
  id?: number;
  nombre: string;
  descripcion: string;
  fecha: string; // Formato YYYY-MM-DD
  lugar: string;
  capacidadMaxima: number;
  participantes?: Participante[];
}

// En desarrollo usa el proxy de Vite (/api → localhost:8080) para evitar CORS
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/eventos';

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = `Error ${response.status}: ${response.statusText}`;
    try {
      // Intentar extraer mensaje si es un JSON con campo "message"
      const parsed = JSON.parse(errorText);
      if (parsed.message) {
        errorMessage = parsed.message;
      }
    } catch {
      if (errorText) {
        errorMessage = errorText;
      }
    }
    throw new Error(errorMessage);
  }
  
  // Para respuestas vacías o texto plano que no sea JSON
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json() as Promise<T>;
  }
  
  return (await response.text()) as unknown as T;
}

export async function listarEventos(): Promise<Evento[]> {
  const response = await fetch(API_BASE_URL);
  return handleResponse<Evento[]>(response);
}

export async function buscarEvento(id: number): Promise<Evento> {
  const response = await fetch(`${API_BASE_URL}/${id}`);
  return handleResponse<Evento>(response);
}

export async function crearEvento(evento: Omit<Evento, 'id' | 'participantes'>): Promise<Evento> {
  const response = await fetch(API_BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(evento),
  });
  return handleResponse<Evento>(response);
}

export async function eliminarEvento(id: number): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'DELETE',
  });
  return handleResponse<string>(response);
}

export async function inscribirParticipante(idEvento: number, participante: Omit<Participante, 'id'>): Promise<Evento> {
  const response = await fetch(`${API_BASE_URL}/${idEvento}/participantes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(participante),
  });
  return handleResponse<Evento>(response);
}

export async function listarParticipantes(idEvento: number): Promise<Participante[]> {
  const response = await fetch(`${API_BASE_URL}/${idEvento}/participantes`);
  return handleResponse<Participante[]>(response);
}
