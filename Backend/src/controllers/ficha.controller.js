import Ficha from '../models/ficha.js';
//import Paciente from '../models/paciente.js'; // Importar el modelo Paciente
import Usuario from '../models/usuario.js';


// Controlador para obtener todas las fichas con la información del paciente asociado
const obtenerFichas = async (req, res) => {
    try {
        const fichas = await Ficha.findAll({
            include: [
                {
                    model: Usuario,
                    attributes: ['nombre', 'email', 'telefono', 'gradoDependencia'] // Seleccionar solo algunos atributos del paciente
                }
            ]
        });

        // if (fichas.length === 0) {
        //     return res.status(404).json({ error: 'No hay fichas registradas' });
        // } causa error en terminar cita por que falla el servicio pero deberia ser solo una lista vacia

        res.json(fichas);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener las fichas' });
    }
};

// Controlador para crear una nueva ficha asociada a un paciente
const crearFicha = async (req, res) => {
    console.log(req.body);
    try {
        const { id_paciente, fecha, resumen, observaciones,rut } = req.body;

        // Verificar que el paciente existe
        const paciente = await Usuario.findByPk(id_paciente);
        if (!paciente) {
            return res.status(404).json({ error: 'Paciente no encontrado' });
        }

        const ficha = await Ficha.create({
            id_paciente,
            fecha,
            resumen,
            observaciones,
            rut
        });

        res.status(201).json({ficha,id:ficha.id_ficha});
    } catch (error) {
        res.status(500).json({ error: 'Error al crear la ficha' });
    }
};

// Controlador para obtener una ficha por su ID con la información del paciente
const obtenerFichaPorId = async (req, res) => {
    const result = Number(req.params.id);
    try {
        const ficha = await Ficha.findByPk(result, {
            include: [
                {
                    model: Usuario,
                    attributes: ['nombre', 'email', 'telefono', 'gradoDependencia']
                }
            ]
        });

        if (!ficha) {
            return res.status(404).json({ error: 'Ficha no encontrada' });
        }

        res.json(ficha);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener la ficha' });
    }
};

// Controlador para actualizar una ficha existente
const actualizarFicha = async (req, res) => {
    const result=Number(req.params.id)
    try {
        const [actualizado] = await Ficha.update(req.body, {
            where: { id_ficha:result }
        });

        if (!actualizado) {
            return res.status(404).json({ error: 'Ficha no encontrada' });
        }

        res.json({ mensaje: 'Ficha actualizada correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar la ficha' });
    }
};

// Controlador para eliminar una ficha
const eliminarFicha = async (req, res) => {
    const result=Number(req.params.id)
    try {
        const eliminado = await Ficha.destroy({
            where: { id_ficha:result }
        });

        if (!eliminado) {
            return res.status(404).json({ error: 'Ficha no encontrada' });
        }

        res.json({ mensaje: 'Ficha eliminada correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar la ficha' });
    }
};

export {
    obtenerFichas,
    crearFicha,
    obtenerFichaPorId,
    actualizarFicha,
    eliminarFicha
};
