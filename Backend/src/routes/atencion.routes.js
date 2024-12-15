import express from "express"
import {
	obtenerAtenciones,
	crearAtencion,
	obtenerAtencionesPorPaciente,
	actualizarAtencion,
	eliminarAtencion,
	getAtencionDetalles
} from "../controllers/atencion.controller.js"

import { authentication } from "../middleware/auth.js"

const router = express.Router()

// Ruta para obtener todas las atenciones
router.get("/", authentication, obtenerAtenciones)

// Ruta para crear una nueva atención
router.post("/", authentication, crearAtencion)

// Ruta para obtener una atención por su ID
router.get("/:id", authentication, obtenerAtencionesPorPaciente)

router.get("/detalles/:id", authentication, getAtencionDetalles)

// Ruta para actualizar una atención por su ID
router.put("/:id", authentication, actualizarAtencion)

// Ruta para eliminar una atención por su ID
router.delete("/:id", authentication, eliminarAtencion)

export default router
