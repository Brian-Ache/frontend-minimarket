import axios from "axios";


//LA RUTA EL ELEMENTO QUE SE USA PARA CONECTAR A LA API(BACKEND)
//Y HACERLE CONSULTAS Y PETICIONES DESDE EL FRONT MEDIANTE AXIOS
// URL del backend según el entorno.
const api = axios.create({
  //si se conecto axitosamente a la api la usa si no se conecta al localhost
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080",
});


api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;