//el tipo que se va a usar durante toda la sesion
export interface User {
  id: number;
  nombre: string;
  usuario: string;
  rol: string;
}

//el tipo que se le envia al backend(api)
export interface LoginRequest {
  usuario: string;
  password: string;
}
//lo que devuelve la api
export interface LoginResponse {
  token: string;
  user: User;
}