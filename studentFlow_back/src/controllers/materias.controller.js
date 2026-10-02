import * as materiasService from "../services/materias.service.js";
import { sendNoContent, sendSuccess } from "../utils/api-response.js";

/**
 * Valida que el código y el nombre de una materia sean únicos para un usuario específico.
 *
 * @async
 * @function ensureUniqueFields
 * @param {string|number} userId - Identificador único del usuario dueño de la materia.
 * @param {Object} materia - Objeto que contiene los datos de la materia a validar.
 * @param {string} [materia.codigo] - Código identificador de la materia (opcional).
 * @param {string} [materia.nombre] - Nombre de la materia (opcional).
 * @param {string|number} [excludeId] - ID de una materia existente a excluir de la validación.
 * @returns {Promise<void>} Retorna ningún valor si las validaciones son exitosas.
 * @throws {HttpError} Código 409 (DUPLICATE_CODE) si el código ya está registrado para ese usuario.
 * @throws {HttpError} Código 409 (DUPLICATE_NAME) si el nombre ya está registrado para ese usuario.
 */

import {
    validateCreateMateria,
    validateMateriaListQuery,
    validateMateriaId,
    validatePatchMateria
} from "../validators/materias.validator.js";

export async function listMaterias(request, response, next) {
  try {
    const filters = validateMateriaListQuery(request.query);
    const result = await materiasService.listMaterias(request.user.id, filters);
    return sendSuccess(response, result.data, 200, result.meta);
  } catch (error) {
    return next(error);
  }
}

/**
 * Obtiene todas las tareas creadas para una materia específica del usuario autenticado.
 *
 * @async
 * @function getMateriaTareas
 * @param {import('express').Request} request - Solicitud HTTP con el usuario autenticado.
 * @param {import('express').Response} response - Respuesta HTTP.
 * @param {import('express').NextFunction} next - Función para pasar errores.
 * @returns {Promise<void>} Responde con la colección de tareas de la materia.
 */
export async function getMateriaTareas(request, response, next) {
  try {
    const id = validateMateriaId(request.params.id);
    const tareas = await materiasService.getTareasByMateriaId(id, request.user.id);
    return sendSuccess(response, tareas);
  } catch (error) {
    return next(error);
  }
}

export async function listEventosByMateria(request, response, next) {
  try {
    const id = validateMateriaId(request.params.id);
    const eventos = await materiasService.listEventosByMateria(id, request.user.id);
    return sendSuccess(response, eventos);
  } catch (error) {
    return next(error);
  }
}

export async function getMateriaById(request, response, next) {
  try {

    const id  = validateMateriaId(request.params.id);
    const materia = await materiasService.getMateriaById(id, request.user.id);
    return sendSuccess(response, materia)

  } catch (error) {
    return next(error);
  }
}

export async function createMateria(request, response, next) {
  try {
    const payload = validateCreateMateria(request.body);
    const materia = await materiasService.createMateria(request.user.id, payload);
    return sendSuccess(response, materia, 201);
  } catch (error) {
    return next(error);
  }
}

export async function replaceMateria(request, response, next) {
  try {
    const id = validateMateriaId(request.params.id);
    const payload = validateCreateMateria(request.body);
    const materia = await materiasService.replaceMateria(id, request.user.id, payload);
    return sendSuccess(response, materia);
  } catch (error) {
    return next(error);
  }
}

export async function updateMateria(request, response, next) {
  try {
    const id = validateMateriaId(request.params.id);
    const payload = validatePatchMateria(request.body);
    const materia = await materiasService.updateMateria(id, request.user.id, payload);
    return sendSuccess(response, materia);
  } catch (error) {
    return next(error);
  }
}

export async function deleteMateria(request, response, next) {
  try {
    const id = validateMateriaId(request.params.id);
    await materiasService.removeMateria(id, request.user.id);
    return sendNoContent(response);
  } catch (error) {
    return next(error);
  }
}