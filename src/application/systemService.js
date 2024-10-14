// src/application/systemService.js
import SystemRepository from "../adapters/repository/systemRepository.js";

// Clase que encapsula la lógica de negocio para "sistemas"
class SystemService {
  constructor() {
    this.systemRepository = new SystemRepository();
  }
  // Obtener todos los sistemas
  async getAllSystems() {
    return await this.systemRepository.getAllSystems();
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
