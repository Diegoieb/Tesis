import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import Swal from 'sweetalert2';  // Importa SweetAlert2

const FinalizarAtencion = () => {
    const location = useLocation();
    const navigate = useNavigate(); // Usamos navigate para redirigir
    const { id_paciente, id_especialista, id_cita } = location.state;
    const [mostrarFicha, setMostrarFicha] = useState(false);
    const [mostrarAtencion, setMostrarAtencion] = useState(false);
    const [mostrarDiagnostico, setMostrarDiagnostico] = useState(false);
    const [mostrarTratamiento, setMostrarTratamiento] = useState(false);
    const [ficha, setFicha] = useState();

    const [fichaData, setFichaData] = useState({
        fecha: '',
        resumen: '',
        observaciones: '',
        rut: '',
    });

    const [atencionData, setAtencionData] = useState({
        fecha_atencion: '',
        tipo_atencion: '',
        resumen: '',
        descripcion: '',
    });

    const [diagnosticoData, setDiagnosticoData] = useState({
        descripcion: '',
        fecha_diagnostico: '',
    });

    const [tratamientoData, setTratamientoData] = useState({
        descripcion: '',
        fecha_inicio: '',
        fecha_fin: '',
    });

    const obtenerFichas = async () => {
        try {
            const response = await api.get('/fichas', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
            const fichaPaciente = response.data.find((ficha) => ficha.id_paciente === id_paciente);
            if (!fichaPaciente) {
                setMostrarFicha(true);
            } else {
                setFicha(fichaPaciente);
                setMostrarAtencion(true);
            }
        } catch (err) {
            Swal.fire('Error', 'Error al obtener las fichas', 'error');
        }
    };

    const manejarCreacionFicha = async () => {
        try {
            const response = await api.post(
                '/fichas',
                { ...fichaData, id_paciente },
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );
            const nuevaFicha = response.data.ficha.id_ficha;
            setFicha(nuevaFicha);
            setMostrarFicha(false);
            setMostrarAtencion(true);
        } catch (err) {
            Swal.fire('Error', 'Error al crear la ficha', 'error');
        }
    };

    const manejarCreacionAtencion = async () => {
        try {
            const response = await api.post(
                '/atencion',
                { ...atencionData, id_ficha: ficha.id_ficha, id_especialista, id_cita },
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );
            const nuevaAtencion = response.data;
            setAtencionData((prev) => ({ ...prev, id_atencion: nuevaAtencion.id_atencion }));
            setMostrarAtencion(false);
            setMostrarDiagnostico(true);
        } catch (err) {
            Swal.fire('Error', 'Error al crear la atención', 'error');
        }
    };

    const manejarCreacionDiagnostico = async () => {
        try {
            const response = await api.post(
                '/diagnosticos',
                { ...diagnosticoData, id_atencion: atencionData.id_atencion },
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );
            const nuevoDiagnostico = response.data;
            setDiagnosticoData((prev) => ({ ...prev, id_diagnostico: nuevoDiagnostico.id_diagnostico }));
            setMostrarDiagnostico(false);
            setMostrarTratamiento(true);
        } catch (err) {
            Swal.fire('Error', 'Error al crear el diagnóstico', 'error');
        }
    };

    const manejarCreacionTratamiento = async () => {
        try {
            await api.post(
                '/tratamientos',
                { ...tratamientoData, id_paciente, id_especialista, id_diagnostico: diagnosticoData.id_diagnostico },
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );
            // Limpia los campos después de agregar un tratamiento
            setTratamientoData({
                descripcion: '',
                fecha_inicio: '',
                fecha_fin: ''
            });
            const { isConfirmed } = await Swal.fire({
                title: '¿Quieres agregar otro tratamiento?',
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Sí',
                cancelButtonText: 'No'
            });

            if (isConfirmed) {
                setMostrarTratamiento(true);
            } else {
                const { isConfirmed: nuevoDiagnostico } = await Swal.fire({
                    title: '¿Quieres agregar otro diagnóstico?',
                    icon: 'question',
                    showCancelButton: true,
                    confirmButtonText: 'Sí',
                    cancelButtonText: 'No'
                });

                if (nuevoDiagnostico) {
                    setMostrarDiagnostico(true);
                } else {
                    Swal.fire('Proceso finalizado', '', 'success').then(() => {
                        navigate('/citas');  // Redirige a /citas cuando el proceso termine
                    });
                }
            }
        } catch (err) {
            Swal.fire('Error', 'Error al crear el tratamiento', 'error');
        }
    };

    useEffect(() => {
        obtenerFichas();
    }, []);

    return (
        <div className="container">
            <h1 className="my-4">Finalizar Atención</h1>
            {mostrarFicha && (
                <div className="card p-3 mb-4">
                    <h2>Crear Ficha</h2>
                    <form onSubmit={(e) => { e.preventDefault(); manejarCreacionFicha(); }}>
                        <input type="datetime-local" className="form-control mb-2" placeholder="Fecha" onChange={(e) => setFichaData({ ...fichaData, fecha: e.target.value })} required />
                        <textarea className="form-control mb-2" placeholder="Resumen" onChange={(e) => setFichaData({ ...fichaData, resumen: e.target.value })} required />
                        <textarea className="form-control mb-2" placeholder="Observaciones" onChange={(e) => setFichaData({ ...fichaData, observaciones: e.target.value })} required />
                        <input type="text" className="form-control mb-2" placeholder="RUT" onChange={(e) => setFichaData({ ...fichaData, rut: e.target.value })} required />
                        <button type="submit" className="btn btn-primary">Guardar Ficha</button>
                    </form>
                </div>
            )}
            {mostrarAtencion && (
                <div className="card p-3 mb-4">
                    <h2>Crear Atención</h2>
                    <form onSubmit={(e) => { e.preventDefault(); manejarCreacionAtencion(); }}>
                        <input type="datetime-local" className="form-control mb-2" placeholder="Fecha Atención" onChange={(e) => setAtencionData({ ...atencionData, fecha_atencion: e.target.value })} required />
                        <textarea className="form-control mb-2" placeholder="Tipo de Atención" onChange={(e) => setAtencionData({ ...atencionData, tipo_atencion: e.target.value })} required />
                        <textarea className="form-control mb-2" placeholder="Resumen" onChange={(e) => setAtencionData({ ...atencionData, resumen: e.target.value })} required />
                        <textarea className="form-control mb-2" placeholder="Descripción" onChange={(e) => setAtencionData({ ...atencionData, descripcion: e.target.value })} required />
                        <button type="submit" className="btn btn-primary">Guardar Atención</button>
                    </form>
                </div>
            )}
            {mostrarDiagnostico && (
                <div className="card p-3 mb-4">
                    <h2>Crear Diagnóstico</h2>
                    <form onSubmit={(e) => { e.preventDefault(); manejarCreacionDiagnostico(); }}>
                        <textarea className="form-control mb-2" placeholder="Descripción" onChange={(e) => setDiagnosticoData({ ...diagnosticoData, descripcion: e.target.value })} required />
                        <input type="datetime-local" className="form-control mb-2" placeholder="Fecha Diagnóstico" onChange={(e) => setDiagnosticoData({ ...diagnosticoData, fecha_diagnostico: e.target.value })} required />
                        <button type="submit" className="btn btn-primary">Guardar Diagnóstico</button>
                    </form>
                </div>
            )}
            {mostrarTratamiento && (
                <div className="card p-3 mb-4">
                    <h2>Crear Tratamiento</h2>
                    <form onSubmit={(e) => { e.preventDefault(); manejarCreacionTratamiento(); }}>
                        <textarea className="form-control mb-2" placeholder="Descripción del Tratamiento" onChange={(e) => setTratamientoData({ ...tratamientoData, descripcion: e.target.value })} required />
                        <input type="date" className="form-control mb-2" placeholder="Fecha de Inicio" onChange={(e) => setTratamientoData({ ...tratamientoData, fecha_inicio: e.target.value })} required />
                        <input type="date" className="form-control mb-2" placeholder="Fecha de Fin" onChange={(e) => setTratamientoData({ ...tratamientoData, fecha_fin: e.target.value })} required />
                        <button type="submit" className="btn btn-primary">Guardar Tratamiento</button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default FinalizarAtencion;
