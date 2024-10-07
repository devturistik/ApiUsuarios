// src/application/userService.js

import UserRepository from '../adapters/repository/userRepository.js'; // Importa la clase UserRepository

const userRepository = new UserRepository(); // Crea una instancia de UserRepository

class AuthService {
  async getUserById(id) {
    return await userRepository.getUserById(id);
  }

  async login(email, password) {
    try {
      const user = await userRepository.loginUser(email, password);
      if (!user) {
        return null; // Retorna null si el usuario no se encuentra
      }
      return user;
    } catch (error) {
      console.error('Error during login:', error);
      throw error; // Propaga el error
    }
  }
}

export default new AuthService(); // Exporta una instancia de AuthService
