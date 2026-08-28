export interface User {
  id: string;
  nombre: string;
  apellido: string;
  username: string;
  email: string;
  rol: string;
  enabled: boolean;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  usuario: User;
}
