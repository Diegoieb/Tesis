import React, { useEffect, useState } from "react";
import { Container, Row, Col, Table, Modal, Button } from "react-bootstrap";
import Swal from "sweetalert2"; // Asegúrate de tener instalado SweetAlert2
import api from "../../api/axios";
import "./atenciones..css";
import { Menu } from "../Navbar/Menu";
import { useNavigate } from "react-router-dom";

const Atenciones = () => {
  const navigate = useNavigate();
  const [atenciones, setAtenciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detalleAtencion, setDetalleAtencion] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const usuario = localStorage.getItem("usuario");
  let newUser1 = null;
  let userId = null;

  if (usuario) {
    try {
      newUser1 = JSON.parse(usuario);
      userId = newUser1?.id_usuario || null;
    } catch (error) {
      console.error("Error al analizar el JSON del usuario:", error);
    }
  } else {
    console.warn("No se encontró el usuario en el localStorage");
  }

  // Obtener las atenciones del paciente desde el backend
  useEffect(() => {
    const fetchAtenciones = async () => {
      console.log("ID:", userId);
      try {
        const response = await api.get(`/atencion/${userId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setAtenciones(response.data);

        // Si no hay atenciones, mostrar alerta y redirigir
        if (response.data.length === 0) {
          Swal.fire({
            icon: "info",
            title: "Sin Atenciones",
            text: "No posee atenciones registradas. Será redirigido al calendario.",
            confirmButtonText: "Aceptar",
          }).then(() => {
            navigate("/calendario");
          });
        }
      } catch (err) {
        console.error("Error al obtener las atenciones:", err);
        Swal.fire({
          icon: "info",
          title: "Sin Atenciones",
          text: "No posee atenciones registradas. Será redirigido al calendario.",
          confirmButtonText: "Aceptar",
        }).then(() => {
          navigate("/calendario");
        })
      } finally {
        setLoading(false);
      }
    };

    fetchAtenciones();
  }, [userId, navigate]);

  if (loading) {
    return <p>Cargando...</p>;
  }

  // Función para abrir el modal con los detalles
  const handleVerDetalles = (atencion) => {
    api
      .get(`/atencion/detalles/${atencion.id_atencion}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((response) => {
        setDetalleAtencion(response.data);
        setShowModal(true);
      })
      .catch((err) => {
        console.error("Error al obtener los detalles:", err);
      });
  };

  // Función para cerrar el modal
  const handleCloseModal = () => {
    setShowModal(false);
    setDetalleAtencion(null);
  };

  return (
    <Container fluid className="atenciones">
      {/* Navbar */}
      <Menu />

      {/* Main Content */}
      <h3 className="text-center mb-4">Mis Atenciones</h3>
      <Row className="px-4">
        <Col>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Especialista</th>
                <th>Tipo de Atención</th>
                <th>Resumen</th>
                <th>Detalles</th>
              </tr>
            </thead>
            <tbody>
  {atenciones.map((atencion) => (
    <tr key={atencion.id_atencion}>
      <td>{new Date(atencion.fecha_atencion).toLocaleString()}</td>
      <td>{atencion.especialista ? atencion.especialista.nombre +' ('+atencion.especialista.rut+')' : "No asignado"}</td>
      <td>{atencion.tipo_atencion}</td>
      <td>{atencion.resumen}</td>
      <td>
        <button
          className="btn btn-info"
          onClick={() => handleVerDetalles(atencion)}
        >
          Ver detalles
        </button>
      </td>
    </tr>
  ))}
</tbody>
          </Table>
        </Col>
      </Row>

      {/* Modal con detalles de la atención */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Detalles de la Atención</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {detalleAtencion ? (
            <>
              <h5>Diagnósticos:</h5>
              {detalleAtencion.diagnosticos.map((diagnostico, index) => (
                <div key={index}>
                  <p><strong>Descripción:</strong> {diagnostico.descripcion}</p>
                  <p><strong>Fecha:</strong> {new Date(diagnostico.fecha_diagnostico).toLocaleDateString()}</p>
                  <h6>Tratamientos:</h6>
                  {diagnostico.tratamientos.map((tratamiento, tIndex) => (
                    <div key={tIndex} style={{ marginLeft: "20px" }}>
                      <p><strong>Descripción:</strong> {tratamiento.descripcion}</p>
                      <p><strong>Fecha de inicio:</strong> {new Date(tratamiento.fecha_inicio).toLocaleDateString()}</p>
                      <p><strong>Fecha de fin:</strong> {new Date(tratamiento.fecha_fin).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
              ))}
            </>
          ) : (
            <p>Cargando detalles...</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Atenciones;
