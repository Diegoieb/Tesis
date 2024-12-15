import './Registro.css'
import api from '../../api/axios'
import { useState } from 'react'
import Swal from 'sweetalert2'
import { useNavigate } from 'react-router-dom'
import { normaliceRut, notificaError, validarRut } from '../../utils'
import moment from "moment";
const Registro=()=>{
  const hoyMenos18 = moment().subtract(18, 'years').format('YYYY-MM-DD'); // Fecha mínima: 18 años atrás

    const [nombre,setNombre]=useState('');
    const [especialidad,setEspecialidad]=useState('');
    const [telefono,setTelefono]=useState('+56');
    const [direccion,setDireccion]=useState('');
    const [email,setEmail]=useState('');
    const [password,setPassword]=useState('');
    const [rol,setRol]=useState("Paciente");
    const [rut,setRut]=useState('');
    const [fechaNacimiento,setFechaNacimiento]=useState('');
    const [gradoDependencia,setGradoDependencia]=useState('');
    const visible=true;
    const [esEspecialista,setEsEspecialista]=useState(false);
    const navigate=useNavigate();
    const handleRegistro=async(e)=>{
        e.preventDefault();
        const {valid,rutFormateado}=validar()
        if (!valid) return;
        try {
            const response=await api.get(`/usuario/rut/${rutFormateado}`);
            if(response.status!=204){
            notificaError('error', ' ya existe un usuario con ese rut')
            return 
          }

        } catch (error) {
              Swal.fire({
                icon: "error",
                title: "Oops...",
                text: "A ocurrido un error, vuelva a intentar",
            });
        }
        try{
            const response=await api.post('/usuario',{nombre,especialidad,telefono,direccion,email,password,rol,rut:rutFormateado,fechaNacimiento,gradoDependencia,visible});
          if(response.status==201){
            Swal.fire({
                title: "Bienvenido",
                text: "Te has registrado correctamente",
                icon: "success"
            });
            navigate('/calendario');
          }
         
           
        }catch(err){
            Swal.fire({
                icon: "error",
                title: "Oops...",
                text: "A ocurrido un error, vuelva a intentar",
            });
        }
    }    
const handlerChecked=async(e)=>{
    //e.preventDefault();
    //console.log(e.target.checked)
    //if (!validar()) return;
    const seleccion=e.target.checked
    try{
        setEsEspecialista(seleccion);
        if(seleccion){
            setRol("Especialista");
            setGradoDependencia('');
            
        }else{
            setRol("Paciente");
            setEspecialidad('');
        }
    }catch(err){
        console.log("algo salio mal");
        Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "A ocurrido un error, vuelva a intentar",
        });
    }
}
const validar = () => {
    if (!nombre || !telefono || !direccion || !email || !password || !rut || !fechaNacimiento || (esEspecialista && !especialidad) || (!esEspecialista && !gradoDependencia)) {
        notificaError('Campos incompletos','Por favor, completa todos los campos.' )
        return {valid:false, rutFormateado:''};
    }

    let rutavalidar=normaliceRut(rut)
    if(!validarRut(rutavalidar)){
        notificaError('Problemas con el rut', 'el rut ingresado no es valido')
        return {valid:false, rutFormateado:''};
    }
    setRut(rutavalidar)
    return {valid:true, rutFormateado:rutavalidar};
};

const handlechangeTelefono=({target:{value}})=>{
if(!value.startsWith('+56')){
    setTelefono('+56')
    return
}

if(value.length>12) return


setTelefono(value)
}
 const handleFechaNacimientoChange = (e) => {
    const fechaSeleccionada = e.target.value;

    // Validar si la fecha seleccionada es mayor al mínimo permitido
    if (moment(fechaSeleccionada).isAfter(hoyMenos18)) {
      notificaError('error', 'debes ser mayor de edad para registrarte')
      return;
    }

    setFechaNacimiento(fechaSeleccionada);
  };
return(
    <>
    <div className='fondo'>
        <form onSubmit={handleRegistro} className='contenedor'>
            <h1  className="titulo display-5">Registro</h1>
            <input required={true} className='form-control' type="text"value={nombre} onChange={(e)=>setNombre(e.target.value)} placeholder='Nombre'></input>
            <input className='form-control' type="text" value={telefono} onChange={handlechangeTelefono} placeholder='Telefono'></input>
            <input className='form-control' type="text"value={direccion} onChange={(e)=>setDireccion(e.target.value)} placeholder='Direccion'></input>
            <input className='form-control' type="email" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder='Email'></input>
            <input className='form-control' type='password' value={password} onChange={(e)=>setPassword(e.target.value)} placeholder='Password'></input>
            <input className='form-control' type='text' value={rut} onChange={(e)=>setRut(e.target.value)} placeholder='Rut'></input>
 <input
      className="form-control"
      type="date"
      max={hoyMenos18} // Mínimo 18 años hacia atrás
      value={fechaNacimiento}
      onChange={handleFechaNacimientoChange}
      placeholder="Fecha de Nacimiento"
    />            
          {!esEspecialista && (<>
            <label htmlFor="selectasistencia">Seleccione Nivel Dependencia</label>
  <select
  id='selectasistencia'
    className="form-control"
    value={gradoDependencia} // Cambiar el estado relacionado
    onChange={(e) => setGradoDependencia(e.target.value)} // Actualizar el estado con el valor seleccionado
  >
    <option value="">seleccione...</option>
    <option value="Leve">Leve</option>
    <option value="Moderado">Moderado</option>
    <option value="Alto">Alto</option>
  </select>
</>)}
            
           {esEspecialista && (<>
            <label htmlFor="selectEspecialidad"> Seleccione Especialidad Médica</label>
  <select
  id='selectEspecialidad'
    className="form-control"
    value={especialidad} // Estado de la especialidad seleccionada
    onChange={(e) => setEspecialidad(e.target.value)} // Actualiza el estado con la especialidad seleccionada
  >
    <option value="">seleccione...</option>
    <option value="Cardiología">Cardiología</option>
    <option value="Pediatría">Pediatría</option>
    <option value="Dermatología">Dermatología</option>
    <option value="Neurología">Neurología</option>
    <option value="Gastroenterología">Gastroenterología</option>
    <option value="Medicina General">Medicina General</option>
    <option value="Traumatología">Traumatología</option>
  </select>
</>)}
            <div className='check'>
            <input className='checkbox'  type="checkbox" value={esEspecialista}  onClick={handlerChecked}  ></input><p>Especialista</p>
            </div>
{esEspecialista && (
  <p>
    <b>Nota:</b> Su cuenta será activada una vez que los datos proporcionados hayan sido verificados y aprobados. Por favor, asegúrese de ingresar información veraz y precisa, ya que esto es fundamental para garantizar la autenticidad y confianza en el proceso.
  </p>
)}

            <button className='btn btn-secondary mt-4 boton' type='submit'>Guardar</button>
        </form>
    </div>
    </>
)
}
export default Registro;