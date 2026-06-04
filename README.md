# Eventora — Evaluación sumativa 1

Sistema de **gestión de eventos universitarios** que permite crear eventos, consultarlos, eliminarlos e inscribir participantes con control de capacidad. El mismo dominio de negocio está implementado tres veces con distintos estilos arquitectónicos, y una **única interfaz web** (`frontend/`) consume cualquiera de los backends.

## De qué se trata el proyecto

Este repositorio es la entrega de la asignatura **Arquitectura de Software**. El objetivo es comparar cómo se organiza el mismo caso de uso — **Eventora** — bajo tres enfoques:

| Carpeta | Estilo | Idea principal |
|---------|--------|----------------|
| `espagueti/` | Código espagueti | Lógica, persistencia y API mezcladas en pocas clases sin capas claras. |
| `capas/` | Arquitectura en capas | Separación clásica: entidades, repositorio, servicio y controlador. |
| `ddd/` | Domain-Driven Design | Dominio, casos de uso (aplicación), infraestructura y presentación. |

Los tres backends exponen la **misma API REST** sobre `/eventos`, usan **Spring Boot 4** con **Java 17**, persisten en **PostgreSQL** y comparten el frontend **React + TypeScript + Vite** en la raíz del proyecto.

### Funcionalidades

- Crear, listar, consultar y eliminar eventos.
- Inscribir participantes en un evento (respetando la capacidad máxima).
- Listar participantes de un evento.
- Interfaz web **Eventora** para operar el sistema sin usar solo la API.

### Estructura del repositorio

```
evaluacion-sumativa-1/
├── frontend/          # UI compartida (React + Vite)
├── espagueti/         # Backend estilo espagueti + docker-compose
├── capas/             # Backend en capas + docker-compose
└── ddd/               # Backend DDD + docker-compose
```

## Requisitos

Para levantar un stack completo con Docker:

- [Docker](https://www.docker.com/) y Docker Compose v2

Para desarrollo local sin Docker (opcional):

- Java 17+
- Maven (incluido `mvnw` en cada backend)
- Node.js 20+ y npm
- PostgreSQL 17 con base de datos `gestion_eventos` (usuario/contraseña: `postgres` / `postgres`)

## Cómo levantar cada implementación

Cada backend tiene su propio `docker-compose.yml`, que levanta **PostgreSQL**, el **backend** y el **frontend compartido** (`../frontend`).

> **Importante:** los tres stacks usan los mismos puertos (`5432`, `8080`, `5173`). Solo puedes tener **uno activo a la vez**. Antes de cambiar de arquitectura, detén el stack actual con `docker compose down`.

### 1. Arquitectura espagueti

```bash
cd espagueti
docker compose up --build
```

| Servicio   | URL / puerto              |
|------------|---------------------------|
| Frontend   | http://localhost:5173     |
| API        | http://localhost:8080     |
| PostgreSQL | localhost:5432            |

### 2. Arquitectura en capas

```bash
cd capas
docker compose up --build
```

Mismos puertos y URLs que en espagueti.

### 3. Arquitectura DDD

```bash
cd ddd
docker compose up --build
```

Mismos puertos y URLs que en los anteriores.

### Detener un stack

Desde la carpeta donde lo iniciaste:

```bash
docker compose down
```

Para eliminar también el volumen de datos de PostgreSQL:

```bash
docker compose down -v
```

## Desarrollo local (sin Docker)

Si prefieres ejecutar servicios por separado:

1. **Base de datos:** PostgreSQL en `localhost:5432` con la base `gestion_eventos`.
2. **Backend:** en la carpeta del estilo que quieras probar:

   ```bash
   cd ddd   # o capas / espagueti
   ./mvnw spring-boot:run
   ```

   En Windows:

   ```powershell
   .\mvnw.cmd spring-boot:run
   ```

3. **Frontend:** en otra terminal:

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

   Abre http://localhost:5173. Vite redirige `/api` hacia `http://localhost:8080` para evitar problemas de CORS.

## API REST (común a los tres backends)

Base: `http://localhost:8080/eventos`

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/eventos` | Listar todos los eventos |
| `GET` | `/eventos/{id}` | Obtener un evento por id |
| `POST` | `/eventos` | Crear evento |
| `DELETE` | `/eventos/{id}` | Eliminar evento |
| `POST` | `/eventos/{idEvento}/participantes` | Inscribir participante |
| `GET` | `/eventos/{idEvento}/participantes` | Listar participantes del evento |

Ejemplo de cuerpo para crear evento:

```json
{
  "nombre": "Hackathon",
  "descripcion": "Competencia de desarrollo",
  "fecha": "2026-06-15",
  "lugar": "Auditorio",
  "capacidadMaxima": 50
}
```

Ejemplo para inscribir participante:

```json
{
  "nombre": "Ana García",
  "correo": "ana@correo.edu",
  "carrera": "Ingeniería de Software"
}
```

## Tecnologías

- **Backend:** Spring Boot 4, Spring Data JPA, PostgreSQL
- **Frontend:** React 19, TypeScript, Vite 8
- **Contenedores:** Docker Compose (Postgres 17, API Java, dev server Vite)
