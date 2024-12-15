import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import Swal from 'sweetalert2';  // Importa SweetAlert2
import moment from 'moment';
import { Menu } from "../Navbar/Menu";
import { Container } from "react-bootstrap";
import { Page, Text, View, Document, StyleSheet,PDFDownloadLink } from '@react-pdf/renderer';
import localization from 'moment/locale/es';
moment.locale('es')
moment.updateLocale('es', {
    months: 'enero_febrero_marzo_abril_mayo_junio_julio_agosto_septiembre_octubre_noviembre_diciembre'.split('_'),
    weekdays: 'domingo_lunes_martes_miércoles_jueves_viernes_sábado'.split('_'),
});
console.log(moment().toLocaleString())
const DetalleCita = () => {
 
    const location = useLocation();
    const navigate = useNavigate(); // Usamos navigate para redirigir
    const { id_cita } = location.state;
    const [cita, setCita] = useState(null);

    const GetDataCita = async () => {
        try {
            const response = await api.get(`/citas/${id_cita}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            const cita = response.data;
            setCita(cita);
        } catch (err) {
            Swal.fire('Error', 'Error al obtener la informacion de la cita', 'error');
        }
    };

    useEffect(() => {
         
        GetDataCita();
    }, []);

    if (cita == null) {
        return 'Cargando....';
    }

    // Estilos en línea
    const cardStyle = {
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
        marginTop: '20px',
        padding: '20px'
    };

    const sectionStyle = {
        marginBottom: '20px'
    };

    const h5Style = {
        fontSize: '1.25rem',
        marginBottom: '10px',
        color: '#00796b'
    };

    const ulStyle = {
        listStyleType: 'none',
        paddingLeft: '0'
    };

    const liStyle = {
        marginBottom: '10px'
    };

    const strongStyle = {
        color: '#00796b'
    };

    const containerStyle = {
        backgroundColor: '#e0f7fa',
        padding: '20px',
        minHeight: '100vh' // Para ocupar toda la altura de la pantalla
    };

    const rowStyle = {
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between'
    };

    const columnStyle = {
        flex: '1 1 45%', // Dos columnas que ocupan el 45% del ancho
        marginBottom: '20px'
    };

    return (
           <Container fluid className="px-0">
      <Menu />
        <div style={containerStyle}>
            <h2>Detalles de la Cita <PDFDownloadLink
    document={<MyDocument cita={cita} />}
    fileName={`detalle_cita_${cita.id_cita}.pdf`}
    style={{
      textDecoration: 'none',
      padding: '10px',
      color: '#fff',
      backgroundColor: '#00796b',
      borderRadius: '5px',
      marginTop: '20px',
      display: 'inline-block',
    }}
  >
    {({ loading }) => (loading ? 'Generando PDF...' : 'Descargar PDF')}
  </PDFDownloadLink></h2>
            <div className="card" style={cardStyle}>
                <div style={rowStyle}>
                    <div style={columnStyle}>
                        <h5 style={h5Style}>Información General</h5>
                        <p><strong style={strongStyle}>Fecha de la Cita:</strong> {moment(cita.fecha_cita).format('dddd, D [de] MMMM [de] YYYY, h:mm A')}</p>
                        <p><strong style={strongStyle}>Estado:</strong> {cita.estado}</p>
                        <p><strong style={strongStyle}>Especialista:</strong> {cita.Especialista?.nombre} - {cita.Especialista?.especialidad}</p>
                        <p><strong style={strongStyle}>Paciente:</strong> {cita.Paciente?.nombre} ({cita.Paciente?.rut})</p>
                    </div>

                    <div style={columnStyle}>
                        <h5 style={h5Style}>Atenciones</h5>
                        {cita.atencions?.length > 0 ? (
                            <ul style={ulStyle}>
                                {cita.atencions.map((atencion) => (
                                    <li key={atencion.id_atencion} style={liStyle}>
                                        <strong style={strongStyle}>Fecha:</strong> {moment(atencion.fecha_atencion).format('dddd, D [de] MMMM [de] YYYY, h:mm A')}<br />
                                        <strong style={strongStyle}>Tipo de Atención:</strong> {atencion.tipo_atencion}<br />
                                        <strong style={strongStyle}>Resumen:</strong> {atencion.resumen}<br />
                                        <strong style={strongStyle}>Descripción:</strong> {atencion.descripcion}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>No hay atenciones registradas para esta cita.</p>
                        )}
                    </div>
                </div>

                <div style={rowStyle}>
                    <div style={columnStyle}>
                        <h5 style={h5Style}>Ficha</h5>
                        {cita.ficha?.length > 0 ? (
                            <ul style={ulStyle}>
                                {cita.ficha.map((ficha) => (
                                    <li key={ficha.id_ficha} style={liStyle}>
                                        <strong style={strongStyle}>Fecha de Ficha:</strong> {moment(ficha.fecha).format('dddd, D [de] MMMM [de] YYYY, h:mm A')}<br />
                                        <strong style={strongStyle}>Resumen:</strong> {ficha.resumen}<br />
                                        <strong style={strongStyle}>Observaciones:</strong> {ficha.observaciones}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>No hay fichas registradas para esta cita.</p>
                        )}
                    </div>

                    <div style={columnStyle}>
                        <h5 style={h5Style}>Diagnósticos</h5>
                        {cita.atencions?.map((atencion) => (
                            atencion.diagnosticos?.length > 0 ? (
                                <ul key={atencion.id_atencion} style={ulStyle}>
                                    {atencion.diagnosticos.map((diagnostico) => (
                                        <li key={diagnostico.id_diagnostico} style={liStyle}>
                                            <strong style={strongStyle}>Descripción:</strong> {diagnostico.descripcion}<br />
                                            <strong style={strongStyle}>Fecha de Diagnóstico:</strong> {moment(diagnostico.fecha_diagnostico).format('dddd, D [de] MMMM [de] YYYY, h:mm A')}<br />
                                            <strong style={strongStyle}>Tratamientos:</strong>
                                            {diagnostico.tratamientos?.length > 0 ? (
                                                <ul style={ulStyle}>
                                                    {diagnostico.tratamientos.map((tratamiento) => (
                                                        <li key={tratamiento.id_tratamiento} style={liStyle}>
                                                            <strong style={strongStyle}>Descripción:</strong> {tratamiento.descripcion}<br />
                                                            <strong style={strongStyle}>Fecha de Inicio:</strong> {moment(tratamiento.fecha_inicio).format('dddd, D [de] MMMM [de] YYYY, h:mm A')}<br />
                                                            <strong style={strongStyle}>Fecha de Fin:</strong> {moment(tratamiento.fecha_fin).format('dddd, D [de] MMMM [de] YYYY, h:mm A')}
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <p>No hay tratamientos registrados para este diagnóstico.</p>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            ) : null
                        ))}
                    </div>
                </div>
            </div>
        </div>
        <div>

</div>
          </Container>
    );
};


const MyDocument = ({ cita }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.card}>
        <Text style={styles.title}>Detalles de la Cita</Text>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información General</Text>
          <Text>Fecha de la Cita: {moment(cita.fecha_cita).format('dddd, D [de] MMMM [de] YYYY, h:mm A')}</Text>
          <Text>Estado: {cita.estado}</Text>
          <Text>Especialista: {cita.Especialista?.nombre} - {cita.Especialista?.especialidad}</Text>
          <Text>Paciente: {cita.Paciente?.nombre} ({cita.Paciente?.rut})</Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Atenciones</Text>
          {cita.atencions?.length > 0 ? (
            cita.atencions.map((atencion) => (
              <View key={atencion.id_atencion} style={styles.subSection}>
                <Text>Fecha: {moment(atencion.fecha_atencion).format('dddd, D [de] MMMM [de] YYYY, h:mm A')}</Text>
                <Text>Tipo de Atención: {atencion.tipo_atencion}</Text>
                <Text>Resumen: {atencion.resumen}</Text>
                <Text>Descripción: {atencion.descripcion}</Text>
              </View>
            ))
          ) : (
            <Text>No hay atenciones registradas.</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Diagnósticos</Text>
          {cita.atencions?.map((atencion) =>
            atencion.diagnosticos?.length > 0 ? (
              atencion.diagnosticos.map((diagnostico) => (
                <View key={diagnostico.id_diagnostico} style={styles.subSection}>
                  <Text>Descripción: {diagnostico.descripcion}</Text>
                  <Text>Fecha de Diagnóstico: {moment(diagnostico.fecha_diagnostico).format('dddd, D [de] MMMM [de] YYYY, h:mm A')}</Text>
                  <Text>Tratamientos:</Text>
                  {diagnostico.tratamientos?.length > 0 ? (
                    diagnostico.tratamientos.map((tratamiento) => (
                      <Text key={tratamiento.id_tratamiento}>- {tratamiento.descripcion}</Text>
                    ))
                  ) : (
                    <Text>No hay tratamientos registrados.</Text>
                  )}
                </View>
              ))
            ) : null
          )}
        </View>
      </View>
    </Page>
  </Document>
);

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 12,
    backgroundColor: '#f5f5f5',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 20,
    marginBottom: 20,
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
  },
  title: {
    fontSize: 18,
    marginBottom: 15,
    textAlign: 'center',
    color: '#00796b',
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#e0f7fa',
    borderRadius: 5,
  },
  sectionTitle: {
    fontSize: 14,
    marginBottom: 10,
    fontWeight: 'bold',
    color: '#00796b',
  },
  subSection: {
    marginBottom: 10,
    paddingLeft: 10,
  },
});


export default DetalleCita;
