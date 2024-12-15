import express from "express"
import {
	obtenerCitas,
	crearCita,
	obtenerCitaPorId,
	actualizarCita,
	eliminarCita,
	obtenerCitasbyIdUser,
	TerminarCita
} from "../controllers/cita.controller.js"

import { authentication } from "../middleware/auth.js"

const router = express.Router()

// Ruta para obtener todas las citas
router.get("/", authentication, obtenerCitas)
router.get("/bySpec/:idUser", authentication, obtenerCitasbyIdUser)

// Ruta para crear una nueva cita
router.post("/", authentication, crearCita)

// Ruta para obtener una cita por su ID
router.get("/:id", authentication, obtenerCitaPorId)

// Ruta para actualizar una cita por su ID
router.put("/:id", authentication, actualizarCita)
//termina cita por su id
router.put("/terminar/:id", authentication, TerminarCita)

// Ruta para eliminar una cita por su ID
router.delete("/:id", authentication, eliminarCita)

export default router
