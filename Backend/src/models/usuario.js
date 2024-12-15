import Ficha from "./ficha.js"
import { DataTypes } from "sequelize"
import { sequelize } from "../database/database.js"
import Tratamiento from "./tratamiento.js"
import Atencion from "./atencion.js"
import Cita from "./citas.js"

// Modelo único para la tabla Usuario
const Usuario = sequelize.define(
	"usuario",
	{
		id_usuario: {
			type: DataTypes.INTEGER,
			allowNull: false,
			autoIncrement: true,
			primaryKey: true
		},
		rut: {
			type: DataTypes.STRING,
			allowNull: true, // Solo requerido si el usuario es un paciente
			unique: true
		},
		nombre: {
			type: DataTypes.TEXT,
			allowNull: false
		},
		especialidad: {
			type: DataTypes.TEXT,
			allowNull: true // Solo necesario si el usuario es un especialista
		},
		telefono: {
			type: DataTypes.TEXT
		},
		email: {
			type: DataTypes.TEXT,
			allowNull: false,
			unique: true
		},
		fechaNacimiento: {
			type: DataTypes.DATEONLY,
			allowNull: true // Solo necesario si el usuario es un paciente
		},
		direccion: {
			type: DataTypes.TEXT,
			allowNull: true // Solo necesario si el usuario es un paciente
		},
		gradoDependencia: {
			type: DataTypes.TEXT,
			allowNull: true // Solo necesario si el usuario es un paciente
		},
		visible: {
			type: DataTypes.BOOLEAN,
			defaultValue: true
		},
		password: {
			type: DataTypes.TEXT,
			allowNull: false
		},
		rol: {
			type: DataTypes.ENUM("especialista", "paciente"),
			allowNull: false
		},
		activo: {
			type: DataTypes.BOOLEAN,
			defaultValue: true,
			allowNull: false
		}
	},
	{
		timestamps: false
	}
)

// Estableciendo relaciones en función del rol

// Si el usuario es un "paciente", puede tener varias fichas y tratamientos
;(async () => {
	const Ficha = (await import("./ficha.js")).default
	Usuario.hasMany(Ficha, {
		foreignKey: "rut",
		sourceKey: "rut",
		constraints: false
	})
	Usuario.hasMany(Tratamiento, {
		foreignKey: "id_paciente",
		sourceKey: "id_usuario",
		constraints: false
	})
	Ficha.belongsTo(Usuario, {
		foreignKey: "rut",
		targetKey: "rut",
		constraints: false
	})
	Tratamiento.belongsTo(Usuario, {
		foreignKey: "id_paciente",
		targetKey: "id_usuario",
		constraints: false
	})
	// Relación con Usuario (como paciente)
	Cita.belongsTo(Usuario, { as: "Paciente", foreignKey: "id_paciente" })

	// Relación con Usuario (como especialista)
	Cita.belongsTo(Usuario, {
		as: "Especialista",
		foreignKey: "id_especialista"
	})

	// Si el usuario es un "especialista", puede tener varias atenciones y tratamientos
	Usuario.hasMany(Atencion, {
		foreignKey: "id_especialista",
		sourceKey: "id_usuario",
		constraints: false
	})
	Usuario.hasMany(Tratamiento, {
		foreignKey: "id_especialista",
		sourceKey: "id_usuario",
		constraints: false
	})
	Atencion.belongsTo(Usuario, {
		foreignKey: "id_especialista",
		targetKey: "id_usuario",
		constraints: false
	})
	Atencion.belongsTo(Usuario, {
		foreignKey: "id_paciente",
		targetKey: "id_usuario",
		constraints: false
	})
	Tratamiento.belongsTo(Usuario, {
		foreignKey: "id_especialista",
		targetKey: "id_usuario",
		constraints: false
	})
})()

export default Usuario
