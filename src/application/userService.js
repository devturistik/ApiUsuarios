import UserRepository from '../adapters/repository/userRepository.js';

const userRepository = new UserRepository();

class UserService {
  async getUserById(id) {
    return await userRepository.getUserById(id);
  }

  async createUser(usuarioClave, usuarioNombre, usuarioDepartamento, usuarioCorreo, usuarioApellido,usuarioCreador) {
    console.log("service usercreador",usuarioCreador);
    try {
      const id = await userRepository.createUser(usuarioClave, usuarioNombre, usuarioDepartamento, usuarioCorreo, usuarioApellido,usuarioCreador);
      console.log("id userServices ", id);
      return id; // Devuelve solo el ID
    } catch (error) {
      if (error.message === 'El email ya está registrado.') {
        throw new Error('El email ya está registrado.'); // Relanza el error con un mensaje específico
      }
      throw error; // Relanza otros errores
    }
  }

  async getAllUsers() {
    try {
      return await userRepository.getAllUsers(); // Obtiene todos los usuarios
    } catch (error) {
      console.error('Error fetching all users:', error);
      throw error; // Relanza el error para que el controlador lo maneje
    }
  }

  async deleteUser(id) {
    try {
      const result = await userRepository.deleteUser(id); // Intenta eliminar el usuario
      return result; // Devuelve el resultado de la eliminación
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error; // Relanza el error para que el controlador lo maneje
    }
  }

  async updateUserById(id, updates) {
    console.log("datos de service", id, updates);
    try {
      const updatedUser = await userRepository.updateUser(id, updates);
      return updatedUser; // Puedes retornar el usuario actualizado si lo necesitas
    } catch (error) {
      console.error('Error updating user in service:', error);
      throw error; // Relanzar el error para manejarlo en el controlador
    }
  }
}

export default new UserService();
