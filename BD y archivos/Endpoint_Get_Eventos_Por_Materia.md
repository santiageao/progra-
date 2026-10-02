# Endpoint GET de eventos por materia

## Objetivo

Documentar el procedimiento para agregar el endpoint `GET /api/v1/materias/:id/eventos` al backend de StudentFlow. El endpoint devuelve los eventos de una materia únicamente si esta pertenece al usuario asociado a la solicitud.

- `id`: identificador de materia recibido en `request.params.id`.
- `userId`: identificador obtenido de `request.user.id`.
- Respuesta exitosa: HTTP 200 con `{ "success": true, "data": [...] }`.
- Si la materia no existe o no pertenece al usuario, el servicio sigue el patrón actual de materias y responde con el error HTTP 404.
- Si la materia sí pertenece al usuario, pero no tiene eventos, el repositorio devuelve `[]`.

El endpoint está implementado en el backend; este documento explica los cambios realizados.

## Archivos involucrados

En este proyecto el repositorio se llama `materias.repositorio.js` (no `materias.repository.js`). La implementación se distribuye en cuatro capas:

1. Ruta: recibe la petición HTTP.
2. Controlador: valida el parámetro y prepara la respuesta.
3. Servicio: aplica la validación de pertenencia y coordina la consulta.
4. Repositorio: ejecuta el `SELECT` parametrizado en MySQL.

## 1. `studentFlow_back/src/routes/materias.routes.js`

Agregar `listEventosByMateria` a la importación desde el controlador:

```js
import {
    listMaterias,
    getMateriaTareas,
    listEventosByMateria,
    getMateriaById,
    createMateria,
    replaceMateria,
    updateMateria,
    deleteMateria
} from "../controllers/materias.controller.js";
```

Registrar la ruta junto a la ruta de tareas, antes de `/:id`:

```js
router.get("/:id/eventos", listEventosByMateria);
```

El router ya está montado bajo `/api/v1/materias`; por eso la ruta declarada aquí produce `GET /api/v1/materias/:id/eventos`.

## 2. `studentFlow_back/src/controllers/materias.controller.js`

El controlador reutiliza `materiasService`, `validateMateriaId` y `sendSuccess`, que ya están importados. Valida el ID, toma el usuario del contexto de la solicitud, llama al servicio y entrega el arreglo dentro de la respuesta estándar:

```js
export async function listEventosByMateria(request, response, next) {
  try {
    const id = validateMateriaId(request.params.id);
    const eventos = await materiasService.listEventosByMateria(id, request.user.id);
    return sendSuccess(response, eventos);
  } catch (error) {
    return next(error);
  }
}
```

El bloque `catch` delega el error al middleware centralizado de errores, igual que el controlador de tareas.

## 3. `studentFlow_back/src/services/materias.service.js`

El servicio sigue el patrón de `getTareasByMateriaId`: primero comprueba que la materia exista y pertenezca al usuario mediante `getMateriaById`; después solicita sus eventos al repositorio.

```js
export async function listEventosByMateria(id, userId) {
  await getMateriaById(id, userId);
  return materiasRepository.findEventosByMateriaAndUserId(id, userId);
}
```

La comprobación evita devolver una lista vacía indistinguible cuando el ID corresponde a una materia ajena o inexistente. En esos casos `getMateriaById` lanza el error HTTP 404 existente.

## 4. `studentFlow_back/src/repositories/materias.repositorio.js`

La tabla `evento` contiene `id_evento`, `id_materia`, `titulo`, `descripcion`, `fecha`, `hora_inicio`, `hora_fin`, `tipo`, `created_at` y `updated_at`. La consulta hace `INNER JOIN` con `materia` para filtrar por el dueño y usa alias camelCase para las columnas compuestas:

```js
export async function findEventosByMateriaAndUserId(id, userId) {
  const [rows] = await pool.execute(
    `SELECT
       e.id_evento AS id,
       e.id_materia AS materiaId,
       e.titulo,
       e.descripcion,
       e.fecha,
       e.hora_inicio AS horaInicio,
       e.hora_fin AS horaFin,
       e.tipo,
       e.created_at AS createdAt,
       e.updated_at AS updatedAt
     FROM evento e
     INNER JOIN materia m ON m.id_materia = e.id_materia
     WHERE m.id_materia = ? AND m.id_usuario = ?
     ORDER BY e.fecha ASC, e.hora_inicio ASC, e.created_at DESC`,
    [id, userId]
  );

  return rows;
}
```

Se devuelve `rows` directamente porque la consulta puede producir varios eventos y no requiere el mapeador de materias o tareas.

## Flujo de la petición

```text
GET /api/v1/materias/:id/eventos
  → materias.routes.js
  → listEventosByMateria (controlador)
  → validateMateriaId
  → listEventosByMateria (servicio)
  → getMateriaById (verifica existencia y propietario)
  → findEventosByMateriaAndUserId (repositorio)
  → MySQL
  → sendSuccess: { success: true, data: eventos }
```

## Verificación

- Materia del usuario con eventos: HTTP 200 y los eventos ordenados por fecha y hora.
- Materia del usuario sin eventos: HTTP 200 con `data: []`.
- Materia inexistente o de otro usuario: HTTP 404 por la validación del servicio.
- ID inválido: error propagado por `validateMateriaId` al middleware centralizado.
- Cada evento incluye `id`, `materiaId`, `titulo`, `descripcion`, `fecha`, `horaInicio`, `horaFin`, `tipo`, `createdAt` y `updatedAt`.
- Confirmar que `request.user.id` está disponible; el middleware temporal actual asigna el usuario de prueba con ID `1`.
