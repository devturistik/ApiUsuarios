// src/application/systemService.js
import SystemRepository from "../adapters/repository/systemRepository.js";

class SystemService {
  constructor() {
    this.systemRepository = new SystemRepository();
  }

  // Validar los datos del sistema
  _validateSystemData({ nombre, descripcion }) {
    if (!nombre) throw new Error("El nombre del sistema es obligatorio.");
    if (!descripcion)
      throw new Error("La descripción del sistema es obligatoria.");
  }

  // Validar el ID
  _validateId(encodedId) {
    try {
      const decodedId = Buffer.from(encodedId, "base64").toString();
      if (isNaN(decodedId)) throw new Error("ID de sistema no válido.");
      return decodedId;
    } catch {
      throw new Error("ID de sistema no válido.");
    }
  }

  // Obtener todos los sistemas
  async getAllSystems() {
    return await this.systemRepository.getAllSystems();
  }

  // Obtener sistema por ID codificado
  async getSystemById(encodedId) {
    const decodedId = this._validateId(encodedId);
    return await this.systemRepository.getSystemById(decodedId);
  }

  // Crear un nuevo sistema
  async createSystem(systemData) {
    this._validateSystemData(systemData);
    const nuevoSystem = { ...systemData };
    return await this.systemRepository.createSystem(nuevoSystem);
  }

  // Actualizar un sistema existente
  async updateSystem(encodedId, newSystemData) {
    const decodedId = this._validateId(encodedId);
    this._validateSystemData(newSystemData);

    return await this.systemRepository.updateSystem(decodedId, newSystemData);
  }

  // Eliminar un sistema por ID codificado
  async deleteSystem(encodedId) {
    const decodedId = this._validateId(encodedId);
    return await this.systemRepository.deleteSystem(decodedId);
  }
}

export default new SystemService();
