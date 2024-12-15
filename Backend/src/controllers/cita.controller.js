import Atencion from "../models/atencion.js"
import Cita from "../models/citas.js"
import Diagnostico from "../models/diagnostico.js"
import Ficha from "../models/ficha.js"
import Tratamiento from "../models/tratamiento.js"
//import Paciente from '../models/paciente.js';
//import Especialista from '../models/especialista.js';
import Usuario from "../models/usuario.js"

// Controlador para obtener todas las citas con información de pacientes y especialistas asociados
const obtenerCitas = async (req, res) => {
	try {
		const citas = await Cita.findAll({
			include: [
				{
					model: Usuario,
					as: "Paciente", // Alias para el paciente
					attributes: ["nombre", "rut", "rol"]
				},
				{
					model: Usuario,
					as: "Especialista", // Alias para el especialista
					attributes: ["nombre", "especialidad", "rol"]
				}
			]
		})
		if (!citas) {
			return res.status(404).json({ error: "No hay citas registradas" })
		}

		res.json(citas)
	} catch (error) {
		res.status(500).json({
			error: "Error al obtener las citas",
			motivo: error
		})
	}
}
const obtenerCitasbyIdUser = async (req, res) => {
	const result = Number(req.params.idUser)

	try {
		// Buscar citas donde id_especialista coincida con el result
		const citas = await Cita.findAll({
			where: {
				id_especialista: result // Filtro por el id_especialista
			},
			include: [
				{
					model: Usuario,
					as: "Paciente", // Alias para el paciente
					attributes: ["nombre", "rut", "rol"]
				},
				{
					model: Usuario,
					as: "Especialista", // Alias para el especialista
					attributes: ["nombre", "especialidad", "rol"]
				}
			]
		})

		if (!citas || citas.length === 0) {
			return res.status(404).json({ error: "No hay citas registradas" })
		}

		res.json(citas)
	} catch (error) {
		res.status(500).json({
			error: "Error al obtener las citas",
			motivo: error.message
		})
	}
}
const TerminarCita = async (req, res) => {
	const { id } = req.params // Obtener ID de la cita desde los parámetros

	try {
		const cita = await Cita.findByPk(id)
		if (!cita) {
			return res.status(404).json({ error: "Cita no encontrada" })
		}
		cita.estado = "Terminado"
		await cita.save()

		res.status(200).json({
			message: "Cita actualizada correctamente",
			cita
		})
	} catch (error) {
		console.error("Error al actualizar la cita:", error)
		res.status(500).json({ error: "Error al actualizar la cita" })
	}
}

// Controlador para crear una nueva cita asociada a un paciente y un especialista
const crearCita = async (req, res) => {
	try {
		const { id_paciente, id_especialista, fecha_cita, estado, title } =
			req.body

		// Verificar que el paciente y el especialista existen
		const paciente = await Usuario.findByPk(id_paciente)
		//
		if (!paciente) {
			return res.status(404).json({ error: "Paciente no encontrado" })
		}
		const especialista = await Usuario.findByPk(id_especialista)
		if (especialista.rol == "especialista") {
			if (!especialista) {
				return res
					.status(404)
					.json({ error: "Especialista no encontrado" })
			}

			const cita = await Cita.create({
				id_paciente,
				id_especialista,
				fecha_cita,
				estado,
				title
			})

			res.status(201).json(cita)
		} else {
			return res.status(401).json({ error: "Especialista no autorizado" })
		}
	} catch (error) {
		res.status(500).json({ error: "Error al crear la cita" })
	}
}

const obtenerCitaPorId = async (req, res) => {
	const result = Number(req.params.id) // Obtener el ID de la cita desde los parámetros

	try {
		// Obtener la cita por su ID
		const cita = await Cita.findByPk(result, {
			include: [
				{
					model: Usuario,
					as: "Paciente", // Alias para el paciente
					attributes: ["nombre", "rut", "rol"]
				},
				{
					model: Usuario,
					as: "Especialista", // Alias para el especialista
					attributes: ["nombre", "especialidad", "rol"]
				},
				{
					model: Atencion,
					as: "atencions", // Alias para las atenciones
					attributes: [
						"id_atencion",
						"fecha_atencion",
						"tipo_atencion",
						"resumen",
						"descripcion",
						"id_cita",
						"id_especialista",
						"id_paciente",
						"id_ficha"
					],
					include: [
						{
							model: Diagnostico,
							as: "diagnosticos", // Alias para los diagnósticos
							attributes: [
								"id_diagnostico",
								"descripcion",
								"fecha_diagnostico"
							],
							include: [
								{
									model: Tratamiento,
									as: "tratamientos", // Alias para los tratamientos
									attributes: [
										"id_tratamiento",
										"descripcion",
										"fecha_inicio",
										"fecha_fin",
										"id_paciente",
										"id_especialista",
										"id_diagnostico"
									]
								}
							]
						}
					]
				}
			]
		})

		// Validar si se encontró la cita
		if (!cita) {
			return res.status(404).json({ error: "Cita no encontrada" })
		}

		// Obtener las fichas basadas en el id_paciente de la cita
		const ficha = await Ficha.findAll({
			where: { id_paciente: cita.id_paciente },
			required: false // No es obligatorio que haya una ficha
		})

		// Convertir la cita a JSON y eliminar las relaciones de referencia circular
		const citaJson = cita.toJSON()

		// Devolver la cita con la información de paciente, especialista, atenciones, y fichas
		res.json({ ...citaJson, ficha })
	} catch (error) {
		console.error(error)
		res.status(500).json({ error: "Error al obtener la cita" })
	}
}

// Controlador para actualizar una cita existente
const actualizarCita = async (req, res) => {
	const { id } = req.params // Obtener ID de la cita desde los parámetros
	const { title, fecha, hora } = req.body // Datos enviados desde el frontend

	try {
		const cita = await Cita.findByPk(id)
		if (!cita) {
			return res.status(404).json({ error: "Cita no encontrada" })
		}

		// Combinar fecha y hora en el formato requerido
		const nuevaFechaHora = `${fecha} ${hora}:00`

		// Actualizar los campos relevantes
		cita.title = title
		cita.fecha_cita = nuevaFechaHora // Asegúrate de que el campo en la BD coincida
		await cita.save()

		res.status(200).json({
			message: "Cita actualizada correctamente",
			cita
		})
	} catch (error) {
		console.error("Error al actualizar la cita:", error)
		res.status(500).json({ error: "Error al actualizar la cita" })
	}
}

// Controlador para eliminar una cita
const eliminarCita = async (req, res) => {
	const result = Number(req.params.id)
	try {
		const eliminado = await Cita.destroy({
			where: { id_cita: result }
		})

		if (!eliminado) {
			return res.status(404).json({ error: "Cita no encontrada" })
		}

		res.json({ mensaje: "Cita eliminada correctamente" })
	} catch (error) {
		res.status(500).json({ error: "Error al eliminar la cita" })
	}
}

export {
	obtenerCitas,
	crearCita,
	obtenerCitaPorId,
	actualizarCita,
	eliminarCita,
	obtenerCitasbyIdUser,
	TerminarCita
}
