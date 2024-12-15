import React, { useState, useEffect } from "react";
import { Container, Row, Col, Button, Form, Modal } from "react-bootstrap";
import { Menu } from "../Navbar/Menu";
import Swal from "sweetalert2";
import api from "../../api/axios";

const perfil = () => {
  const [usuario, setUsuario] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [rol, setRol] = useState(""); // Estado para el rol del usuario
  const [formData, setFormData] = useState({
    rut: "",
    nombre: "",
    especialidad: "",
    telefono: "",
    email: "",
    fechaNacimiento: "",
    direccion: "",
    gradoDependencia: "",
    newPassword: "",
  });

  const userId = JSON.parse(localStorage.getItem("usuario"))?.id_usuario;

  // Cargar datos del usuario y el rol al montar el componente
  useEffect(() => {
    const fetchUsuario = async () => {
      try {
        const response = await api.get(`/usuario/${userId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setUsuario(response.data);
        setFormData({
          rut: response.data.rut || "",
          nombre: response.data.nombre || "",
          especialidad: response.data.especialidad || "",
          telefono: response.data.telefono || "",
          email: response.data.email || "",
          fechaNacimiento: response.data.fechaNacimiento || "",
          direccion: response.data.direccion || "",
          gradoDependencia: response.data.gradoDependencia || "",
          password: response.data.password,
          newPassword:''
        });
        // Asignar el rol desde localStorage
        const userRole = JSON.parse(localStorage.getItem("usuario"))?.rol || "";
        setRol(userRole);
      } catch (error) {
        console.error("Error al cargar los datos del usuario:", error);
      }
    };

    fetchUsuario();
  }, [userId]);

  // Manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Mostrar el modal
  const handleShowModal = () => setShowModal(true);

  // Cerrar el modal
  const handleCloseModal = () => setShowModal(false);

  // Actualizar los datos
  const handleSaveChanges = () => {
    Swal.fire({
      title: "¿Está seguro?",
      text: "Se actualizarán sus datos.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, actualizar",
    }).then((result) => {
      if (result.isConfirmed) {
        // Filtrar los datos a enviar según el rol

        const updatedData = rol === "especialista"
          ? {
              rut: formData.rut,
              nombre: formData.nombre,
              especialidad: formData.especialidad,
              telefono: formData.telefono,
              email: formData.email,
              fechaNacimiento: formData.fechaNacimiento,
              direccion: formData.direccion,
              password:formData.password,
              newPassword: formData.newPassword,
            }
          : {
              rut: formData.rut,
              nombre: formData.nombre,
              gradoDependencia: formData.gradoDependencia,
              telefono: formData.telefono,
              email: formData.email,
              fechaNacimiento: formData.fechaNacimiento,
              direccion: formData.direccion,
              password:formData.password,
              newPassword: formData.newPassword,
            };

        api
          .put(`/usuario/${userId}`, updatedData, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          })
          .then(() => {
            Swal.fire("Actualizado", "Sus datos han sido actualizados.", "success");
            setUsuario({ ...usuario, ...updatedData });
            handleCloseModal();
          })
          .catch((error) => {
            console.error("Error al actualizar los datos:", error);
            Swal.fire("Error", "No se pudieron actualizar los datos.", "error");
          });
      }
    });
  };

  return (
    <Container fluid className="perfil px-0">
      <Menu />
      <h3 className="text-center mb-4">Mi Perfil</h3>
      <Row className="justify-content-center">
        <Col md={6}>
          <div className="card p-4 shadow">
            <h5>Datos del Usuario</h5>
            <p><strong>RUT:</strong> {usuario.rut}</p>
            <p><strong>Nombre:</strong> {usuario.nombre}</p>
            {rol === "especialista" && <p><strong>Especialidad:</strong> {usuario.especialidad}</p>}
            <p><strong>Teléfono:</strong> {usuario.telefono}</p>
            <p><strong>Email:</strong> {usuario.email}</p>
            <p><strong>Fecha de Nacimiento:</strong> {usuario.fechaNacimiento}</p>
            <p><strong>Dirección:</strong> {usuario.direccion}</p>
            {rol !== "especialista" && (
              <p><strong>Grado de Dependencia:</strong> {usuario.gradoDependencia}</p>
            )}
            <Button variant="primary" onClick={handleShowModal}>
              Actualizar
            </Button>
          </div>
        </Col>
      </Row>

      {/* Modal para actualizar datos */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Actualizar Datos</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3" controlId="formRut">
              <Form.Label>RUT</Form.Label>
              <Form.Control
                type="text"
                name="rut"
                value={formData.rut}
                onChange={handleChange}
                placeholder="Ingrese su RUT"
                disabled= {true}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formNombre">
              <Form.Label>Nombre</Form.Label>
              <Form.Control
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                placeholder="Ingrese su nombre"
              />
            </Form.Group>
            {rol === "especialista" && (
              <Form.Group className="mb-3" controlId="formEspecialidad">
                <Form.Label>Especialidad</Form.Label>
                <Form.Control
                  type="text"
                  name="especialidad"
                  value={formData.especialidad}
                  onChange={handleChange}
                  placeholder="Ingrese su especialidad"
                />
              </Form.Group>
            )}
            <Form.Group className="mb-3" controlId="formTelefono">
              <Form.Label>Teléfono</Form.Label>
              <Form.Control
                type="text"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                placeholder="Ingrese su teléfono"
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formEmail">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Ingrese su email"
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formFechaNacimiento">
              <Form.Label>Fecha de Nacimiento</Form.Label>
              <Form.Control
                type="date"
                name="fechaNacimiento"
                value={formData.fechaNacimiento}
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formDireccion">
              <Form.Label>Dirección</Form.Label>
              <Form.Control
                type="text"
                name="direccion"
                value={formData.direccion}
                onChange={handleChange}
                placeholder="Ingrese su dirección"
              />
            </Form.Group>
            {rol !== "especialista" && (
              <Form.Group className="mb-3" controlId="formGradoDependencia">
                <Form.Label>Grado de Dependencia</Form.Label>
                <Form.Control
                  type="text"
                  name="gradoDependencia"
                  value={formData.gradoDependencia}
                  onChange={handleChange}
                  placeholder="Ingrese el grado de dependencia"
                />
              </Form.Group>
            )}
            <Form.Group className="mb-3" controlId="formPassword">
              <Form.Label>Contraseña</Form.Label>
              <Form.Control
                type="password"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                placeholder="Ingrese su nueva contraseña"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSaveChanges}>
            Guardar Cambios
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default perfil;
