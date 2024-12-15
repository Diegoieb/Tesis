import Atencion from "../models/atencion.js"
//import Especialista from '../models/especialista.js';
import Ficha from "../models/ficha.js"
import Diagnostico from "../models/diagnostico.js"
import Usuario from "../models/usuario.js"
import Tratamiento from "../models/tratamiento.js"
import { Op } from "sequelize"
// Controlador para obtener todas las atenciones con información de los especialistas, fichas y diagnósticos asociados
const obtenerAtenciones = async (req, res) => {
	try {
		const atenciones = await Atencion.findAll({
			include: [
				{
					model: Usuario,
					attributes: ["nombre", "especialidad", "rol"]
				},
				{
					model: Ficha,
					attributes: ["fecha"]
				}
			]
		})

		if (atenciones.length === 0) {
			return res
				.status(404)
				.json({ error: "No hay atenciones registradas" })
		}

		res.json(atenciones)
	} catch (error) {
		res.status(500).json({ error: "Error al obtener las atenciones" })
	}
}

// Controlador para crear una nueva atención asociada a un especialista, ficha y posiblemente diagnósticos
const crearAtencion = async (req, res) => {
	try {
		const {
			id_especialista,
			id_ficha,
			id_cita,
			fecha_atencion,
			resumen,
			descripcion,
			tipo_atencion,
			id_paciente
		} = req.body

		// Verificar que el especialista y la ficha existen
		const especialista = await Usuario.findByPk(id_especialista)
		if (!especialista) {
			return res.status(404).json({ error: "Especialista no encontrado" })
		}

		const ficha = await Ficha.findByPk(id_ficha)
		if (!ficha) {
			return res.status(404).json({ error: "Ficha no encontrada" })
		}

		const atencion = await Atencion.create({
			id_especialista,
			id_ficha,
			id_cita,
			fecha_atencion,
			resumen,
			descripcion,
			tipo_atencion,
			id_paciente
		})

		res.status(201).json(atencion)
	} catch (error) {
		console.error("Error al crear la atención:", error) // Agrega logs para depuración
		res.status(500).json({
			error: error.message || "Error al crear la atención"
		})
	}
}

// Controlador para obtener una atención por su ID con información de especialista, ficha y diagnósticos
/*const obtenerAtencionPorId = async (req, res) => {
    const result = Number(req.params.id);
    try {
        const atencion = await Atencion.findByPk(result, {
            include: [
                {
                    model: Especialista,
                    attributes: ['nombre', 'especialidad']
                },
                {
                    model: Ficha,
                    attributes: ['fecha']
                }
            ]
        });

        if (!atencion) {
            return res.status(404).json({ error: 'Atención no encontrada' });
        }

        res.json(atencion);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener la atención' });
    }
};*/

const obtenerAtencionesPorPaciente = async (req, res) => {
	const pacienteId = Number(req.params.id) // ID del paciente recibido desde la URL
	console.log("ID del paciente recibido:", pacienteId) // Verificar el ID del paciente recibido

	try {
		// Buscar todas las atenciones asociadas al paciente
		const atenciones = await Atencion.findAll({
			where: {
				id_paciente: pacienteId // Filtrar por el id del paciente
			}
		})
		var listaEspecialistas = atenciones.map((x) => x.id_especialista)

		const especialistas = await Usuario.findAll({
			where: {
				id_usuario: { [Op.in]: listaEspecialistas }
			}
		})

		const atencionesConEspecialistas = atenciones.map((x) => {
			const infoEspecialista = especialistas.find(
				(y) => y.id_usuario == x.id_especialista
			)
			const nuevaAtencion = {
				descripcion: x.descripcion,
				resumen: x.resumen,
				fecha_atencion: x.fecha_atencion,
				id_atencion: x.id_atencion,
				id_cita: x.id_cita,
				tipo_atencion: x.tipo_atencion,
				especialista: {
					nombre: infoEspecialista?.nombre,
					email: infoEspecialista?.email,
					rut: infoEspecialista?.rut
				}
			}
			return nuevaAtencion
		})
		console.log("Atenciones encontradas:", atenciones) // Verificar las atenciones encontradas

		if (!atenciones || atenciones.length === 0) {
			return res.status(404).json({
				error: "No se encontraron atenciones para este paciente"
			})
		}

		console.log("Atenciones encontradas:", atenciones) // Verificar las atenciones encontradas

		res.json(atencionesConEspecialistas) // Responder con la lista de atenciones
	} catch (error) {
		console.error("Error al obtener las atenciones:", error) // Verificar el error en consola
		res.status(500).json({
			error: "Error al obtener las atenciones del paciente"
		})
	}
}

const getAtencionDetalles = async (req, res) => {
	const { id } = req.params // ID de la atención

	try {
		// Buscar la atención con sus relaciones
		const atencion = await Atencion.findOne({
			where: { id_atencion: id },
			include: [
				{
					model: Diagnostico,
					include: [
						{
							model: Tratamiento
						}
					]
				}
			]
		})

		if (!atencion) {
			return res.status(404).json({ message: "Atención no encontrada" })
		}

		// Retornar los datos al frontend
		res.json(atencion)
	} catch (error) {
		console.error("Error al obtener los detalles de la atención:", error)
		res.status(500).json({
			message: "Error al obtener los detalles de la atención"
		})
	}
}

// Controlador para actualizar una atención existente
const actualizarAtencion = async (req, res) => {
	const result = Number(req.params.id)
	try {
		const [actualizado] = await Atencion.update(req.body, {
			where: { id_atencion: result }
		})

		if (!actualizado) {
			return res.status(404).json({ error: "Atención no encontrada" })
		}

		res.json({ mensaje: "Atención actualizada correctamente" })
	} catch (error) {
		res.status(500).json({ error: "Error al actualizar la atención" })
	}
}

// Controlador para eliminar una atención
const eliminarAtencion = async (req, res) => {
	const result = Number(req.params.id)
	try {
		const eliminado = await Atencion.destroy({
			where: { id_atencion: result }
		})

		if (!eliminado) {
			return res.status(404).json({ error: "Atención no encontrada" })
		}

		res.json({ mensaje: "Atención eliminada correctamente" })
	} catch (error) {
		res.status(500).json({ error: "Error al eliminar la atención" })
	}
}

export {
	obtenerAtenciones,
	crearAtencion,
	obtenerAtencionesPorPaciente,
	actualizarAtencion,
	eliminarAtencion,
	getAtencionDetalles
}
