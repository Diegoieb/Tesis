import './Login.css'
import { useAuth } from '../../auth/auth';
import api from '../../api/axios'
import { useState } from 'react'
import Swal from 'sweetalert2'
import { Navigate, useLinkClickHandler, useNavigate } from 'react-router-dom'


const Login = () => {
  const [email, setEmail]= useState('');
  const [password,setPassword]=useState('');
  const [error,setError]= useState('');
  const { login } = useAuth();
  //console.log("useAuth:"+useAuth())
  const navigate = useNavigate();// se crea una constante para llamar a la funcion y luego llamar a la constante como funcion xd
  const handleLogin=async (e)=>{
    e.preventDefault();
    try{
      //console.log("email:",email)
      //console.log("password:",password)
      const response =await api.post('/login',{email,password},{headers:{
        'Content-Type': 'application/json',
      }});
      //console.log(response)
      const data = await response.data;
      //console.log(data)
      if (data.token) {
        // Si obtienes un token, lo guardas y rediriges
        login(data.token);
        console.log("email:",email)
    
        navigate("/calendario"); // Redirige al calendario
      } else {
        // Manejo de error si el login falla
        alert('Credenciales inválidas');
      }
      Swal.fire({
        title: "Bienvenido",
        text: "Has iniciado sesion "/*+response.data.token*/,
        icon: "success"
      });
    }catch (err){
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "A ocurrido un error, vuelva a intentar",
      });
      //setError("error en las credenciales, intente nuevamente");
    }
  }

  const prueba= async(e)=>{
    e.preventDefault();
    try{
      navigate("/ola")//aqui se llama a la caga 
    }catch(err){
      alert("no funca")
    }
  }

  return (
    <>
    <div className="fondo">
        <div className="contenedor">
            <h1 className="titulo display-5">Iniciar Sesión</h1>{error && <p>{error}</p>}
            
            <input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} className="form-control formulario" placeholder="Email" aria-label="email"></input>
            
            <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} className="form-control formulario" placeholder="Clave" aria-label="Clave"></input>
            <button onClick={handleLogin} className='btn btn-secondary mt-4 boton'>Ingresar</button>
            <p>¿No estas registrado?</p><a href={"/tesis/#/Registro"}>Registrate</a>
            {/* <button  onClick={prueba}>PRUEBAAAAAAAAAAAAA </button> */}
        </div>
    </div>
    </>
  )
}

export default Login