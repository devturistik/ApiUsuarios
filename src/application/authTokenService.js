// src/application/authTokenService.js
import AuthTokenRepository from "../adapters/repository/authTokenRepository.js";
import bcrypt from "bcrypt";

const authTokenRepository = new AuthTokenRepository();

const authService = {
  login: async (username, password) => {
    const sistema = await authTokenRepository.getSystemByUserName(username);

    if (!sistema) {
      return null; // Sistema no encontrado
    }

    // Verificar que el sistema esté activo
    if (!sistema.activo) {
      throw new Error("El usuario no está activado.");
    }

    // Validar la contraseña
    const isPasswordValid = await bcrypt.compare(password, sistema.pass); // Asegúrate de usar 'pass'
    if (!isPasswordValid) {
      return null; // Contraseña incorrecta
    }

    return sistema; // Devuelve el sistema si el inicio de sesión es exitoso
  },
};

export default authService;
