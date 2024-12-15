// index.js
import dotenv from "dotenv"
dotenv.config()

import express from "express"
//import pacienteRoutes from './routes/paciente.routes.js';
import tratamientoRoutes from "./routes/tratamiento.routes.js"
import atencionRoutes from "./routes/atencion.routes.js"
//import especialistaRoutes from './routes/especialista.routes.js';
import diagnosticoRoutes from "./routes/diagnostico.routes.js"
import fichaRoutes from "./routes/ficha.routes.js"
import loginRoutes from "./routes/login.routes.js"
import citaRoutes from "./routes/cita.routes.js"
import usuarioRoutes from "./routes/usuario.routes.js"
import { sequelize } from "./database/database.js"

// Importar los modelos
import Atencion from "./models/atencion.js"
import Diagnostico from "./models/diagnostico.js"
import Tratamiento from "./models/tratamiento.js"
//import Especialista from './models/especialista.js';
import Ficha from "./models/ficha.js"
//import Paciente from './models/paciente.js';
import Cita from "./models/citas.js"
import Usuario from "./models/usuario.js"

import cors from "cors"
const app = express()
const PORT = 3003

app.use(cors())
// Conecta con la base de datos
sequelize
	.authenticate()
	.then(() => {
		console.log("Conexión establecida correctamente.")
	})
	.catch((err) => {
		console.error("No se pudo conectar con la base de datos:", err)
	})

// Sincroniza las tablas y establece las relaciones
;(async () => {
	try {
		await sequelize.sync({
			// force: true
		}) // Esto elimina y recrea las tablas
		console.log("Tablas sincronizadas correctamente.")

		// Establece las relaciones
		Atencion.hasMany(Diagnostico, {
			foreignKey: "id_atencion",
			sourceKey: "id_atencion"
		})
		Diagnostico.belongsTo(Atencion, {
			foreignKey: "id_atencion",
			targetKey: "id_atencion"
		})

		Diagnostico.hasMany(Tratamiento, {
			foreignKey: "id_diagnostico",
			sourceKey: "id_diagnostico"
		})
		Tratamiento.belongsTo(Diagnostico, {
			foreignKey: "id_diagnostico",
			targetKey: "id_diagnostico"
		})

		Usuario.hasMany(Ficha, {
			foreignKey: "rut",
			sourceKey: "rut",
			constraints: false
		})
		Ficha.belongsTo(Usuario, { foreignKey: "rut" })
	} catch (error) {
		console.error("Error al sincronizar las tablas:", error)
	}
})()

// Middleware
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

// Routes
//app.use('/api/pacientes', pacienteRoutes);
app.use("/api/diagnosticos", diagnosticoRoutes)
app.use("/api/tratamientos", tratamientoRoutes)
//app.use('/api/especialistas', especialistaRoutes);
app.use("/api/atencion", atencionRoutes)
app.use("/api/fichas", fichaRoutes)
app.use("/api/login", loginRoutes)
app.use("/api/citas", citaRoutes)
app.use("/api/usuario", usuarioRoutes)

// Caso de que no exista la ruta o haya un error en el servidor

app.use((req, res, next) => {
	console.log("Ruta solicitada:", req.originalUrl)
	res.status(404).send("Ruta no encontrada")
})

app.listen(PORT, () => {
	console.log(`Servidor escuchando en http://localhost:${PORT}`)
})
