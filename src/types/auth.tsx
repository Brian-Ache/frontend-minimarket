//el tipo que se va a usar durante toda la sesion
export interface User {
  id: string;
  nombre: string;
  apellido: string;
  username: string;
  email: string;
  rol: string;
  enabled: boolean;
}

//el tipo que se le envia al backend(api)
export interface LoginRequest {
  username: string;
  password: string;
}

//lo que devuelve la api
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  usuario: User;
}
