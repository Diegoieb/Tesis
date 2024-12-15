import dotenv from "dotenv"
dotenv.config()
import Usuario from "../models/usuario.js"
import Atencion from "../models/atencion.js"
import Ficha from "../models/ficha.js"
import Tratamiento from "../models/tratamiento.js"
import { hashPassword, comparePasswords, generateToken } from "../utils/jwt.js"

// Controlador para obtener todos los usuarios con información de atenciones y tratamientos asociados
const obtenerUsuarios = async (req, res) => {
	try {
		const usuarios = await Usuario.findAll()

		if (usuarios.length === 0) {
			return res
				.status(404)
				.json({ error: "No hay usuarios registrados" })
		}

		res.json(usuarios)
	} catch (error) {
		res.status(500).json({
			error: "Error al obtener los usuarios",
			detalles: error.message
		})
	}
}

// Controlador para crear un nuevo usuario
const crearUsuario = async (req, res) => {
	try {
		const {
			nombre,
			especialidad,
			telefono,
			direccion,
			email,
			password,
			rol,
			rut,
			fechaNacimiento,
			gradoDependencia,
			visible
		} = req.body

		const hashedPassword = await hashPassword(password)
		const activo = rol?.startsWith("E") ? false : true
		console.log(rol, activo)
		const usuario = await Usuario.create({
			nombre,
			especialidad,
			telefono,
			direccion,
			email,
			password: hashedPassword,
			rol,
			rut,
			fechaNacimiento,
			gradoDependencia,
			visible,
			activo
		})

		res.status(201).json(usuario)
	} catch (error) {
		res.status(500).json({
			error: "Error al crear el usuario",
			detalles: error.message
		})
	}
}

// Controlador para obtener un usuario por su ID con información de atenciones y tratamientos
const obtenerUsuarioPorId = async (req, res) => {
	const result = Number(req.params.id)
	try {
		const usuario = await Usuario.findByPk(result)

		if (!usuario) {
			return res.status(404).json({ error: "Usuario no encontrado" })
		}

		res.json(usuario)
	} catch (error) {
		res.status(500).json({
			error: "Error al obtener el usuario",
			detalles: error.message
		})
	}
}
const obtenerUsuarioPorRut = async (req, res) => {
	const rut = req.params.rut // Obtenemos el rut desde los parámetros de la URL
	try {
		// Buscar el usuario por la propiedad 'rut'
		const usuario = await Usuario.findOne({ where: { rut } })

		if (!usuario) {
			return res.status(204).json({})
		}

		res.status(200).json(usuario) // Devolvemos el usuario encontrado
	} catch (error) {
		res.status(500).json({
			error: "Error al obtener el usuario",
			detalles: error.message
		})
	}
}
// Controlador para actualizar un usuario existente
const actualizarUsuario = async (req, res) => {
	const result = Number(req.params.id)
	try {
		const usuarioActualizado = req.body
		const usuarioExistente = await Usuario.findByPk(result)

		if (!usuarioExistente) {
			return res.status(404).json({ error: "Usuario no encontrado" })
		}

		if (usuarioActualizado.newPassword) {
			const passwordMatch =
				usuarioActualizado.password == usuarioExistente.password

			if (!passwordMatch) {
				return res.status(401).json({ error: "Contraseña incorrecta" })
			} else {
				usuarioActualizado.password = await hashPassword(
					usuarioActualizado.newPassword
				)
			}
		}

		await Usuario.update(usuarioActualizado, {
			where: { id_usuario: result }
		})

		res.json({ mensaje: "Usuario actualizado correctamente" })
	} catch (error) {
		res.status(500).json({
			error: "Error al actualizar el usuario",
			detalles: error.message
		})
	}
}

// Controlador para eliminar un usuario
const eliminarUsuario = async (req, res) => {
	const result = Number(req.params.id)
	try {
		const eliminado = await Usuario.destroy({
			where: { id_usuario: result }
		})

		if (!eliminado) {
			return res.status(404).json({ error: "Usuario no encontrado" })
		}

		res.json({ mensaje: "Usuario eliminado correctamente" })
	} catch (error) {
		res.status(500).json({
			error: "Error al eliminar el usuario",
			detalles: error.message
		})
	}
}

// Controlador para iniciar sesión y retornar token
const login = async (req, res) => {
	const { email, password } = req.body

	try {
		const usuario = await Usuario.findOne({
			where: { email, activo: true }
		})

		if (!usuario) {
			return res.status(404).json({ error: "Usuario no encontrado" })
		}

		const passwordMatch = await comparePasswords(password, usuario.password)

		if (!passwordMatch) {
			return res.status(401).json({ error: "Contraseña incorrecta" })
		}

		// Generar token JWT
		const token = generateToken({
			userId: usuario.id_usuario,
			username: usuario.nombre,
			role: usuario.rol
		})

		res.json({ token })
	} catch (error) {
		console.error("Error al iniciar sesión:", error)
		res.status(500).json({ error: "Error interno del servidor" })
	}
}

export {
	obtenerUsuarios,
	crearUsuario,
	obtenerUsuarioPorId,
	actualizarUsuario,
	eliminarUsuario,
	login,
	obtenerUsuarioPorRut
}
