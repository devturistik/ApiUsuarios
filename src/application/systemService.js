// src/application/systemService.js
import SystemRepository from "../adapters/repository/systemRepository.js";

const systemRepository = new SystemRepository();

// Clase que encapsula la lógica de negocio para "sistemas"
class SystemService {
  // Obtener todos los sistemas
  async getAllSystems() {
    try {
      return await systemRepository.getAllSystems();
    } catch (error) {
      console.error("Error al recuperar todos los sistemas:", error);
      throw error; // Relanza el error para que el controlador lo maneje
    }
  }

  // Obtener sistema por ID
  async getSystemById(id) {
    return await systemRepository.getSystemById(id);
  }

  // Crear un nuevo sistema
  async createSystem(nombre, descripcion) {
    return await systemRepository.createSystem(nombre, descripcion);
  }

  // Actualizar un sistema existente
  async updateSystem(id, updates) {
    await systemRepository.updateSystem(id, updates);
  }

  // Eliminar un sistema
  async deleteSystem(id) {
    await systemRepository.deleteSystem(id);
  }
}

export default new SystemService();
