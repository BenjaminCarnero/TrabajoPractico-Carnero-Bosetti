# Nombre del proyecto

Sistema web para Reservas De Lavadero de Autos. Trabajo Final Integrador — Programación II, Ciclo 2026.

## Integrantes y funcionalidad

| Integrante | Funcionalidad (SP, service, ruta y pantalla) | Rama |
|---|---|---|
| Carnero | Reservas: listar servicios activos, buscar o crear cliente y vehículo por patente, crear turno con su detalle. Pantalla `index.html` | `rama-reservas-carnero` |
| Bosetti | Gestión de turnos y estadísticas: listar turnos por fecha o estado, cambiar estado, ingresos por servicio, turnos por estado. Pantallas `tablero.html` y `estadisticas.html` | `rama-tablero-bosetti` |

## Cómo levantar el sistema desde cero

1. Ejecutar `script.sql` en SQL Server.
2. `cd back` y `npm install`
3. Copiar `back/env.ejemplo` como `back/.env` y completar los valores.
4. `npm start`
5. Abrir http://localhost:3000

## Endpoints de la API

| Método | Ruta | Descripción | Éxito | Errores |
|---|---|---|---|---|
| GET | `/api/servicios` | Lista los servicios activos | 200 | |
| GET | `/api/vehiculos/:patente` | Vehículo con los datos de su cliente | 200 | 404 patente no registrada |
| POST | `/api/turnos` | Crea el turno con su detalle; si la patente es nueva crea también cliente y vehículo | 201 | 400 datos inválidos, fecha pasada, servicio inactivo o turno repetido |
