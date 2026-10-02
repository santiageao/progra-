import { Router } from "express";

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

    listMaterias,
    getMateriaTareas,
    listEventosByMateria,
    getMateriaById,
    createMateria,
    replaceMateria,
    updateMateria,
    deleteMateria

} from "../controllers/materias.controller.js";

const router = Router();

//http://localhost:3000/api/v1/materias

router.get("/", listMaterias);
router.get("/:id/tareas", getMateriaTareas);
router.get("/:id/eventos", listEventosByMateria);
router.get("/:id", getMateriaById);
router.post("/", createMateria);
router.put("/:id", replaceMateria);
router.patch("/:id", updateMateria);
router.delete("/:id", deleteMateria);

export default router;