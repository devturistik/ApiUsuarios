// src/application/authTokenService.js
import AuthTokenRepository from '../adapters/repository/authTokenRepository.js';
import bcrypt from 'bcrypt';

const authTokenRepository = new AuthTokenRepository();

const authService = {
    login: async (username, password) => {
        const user = await authTokenRepository.getUserByUserName(username);
        console.log(user); // Para depuración
        if (!user) {
            return null; // Usuario no encontrado
        }

        // Verificar que el usuario esté activo
        if (!user.activo) {
            throw new Error("El usuario no está activado.");
        }

        // Validar la contraseña
        const isPasswordValid = await bcrypt.compare(password, user.pass); // Asegúrate de usar 'pass'
        if (!isPasswordValid) {
            return null; // Contraseña incorrecta
        }

        return user; // Devuelve el usuario si el inicio de sesión es exitoso
    },
};

export default authService;
