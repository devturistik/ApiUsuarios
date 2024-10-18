// src/application/systemService.js
import SystemRepository from "../adapters/repository/systemRepository.js";
import { decodeId } from "../utils/idEncoder.js";

class SystemService {
  constructor() {
    this.systemRepository = new SystemRepository();
  }

  // Validar los datos del sistema
  _validateSystemData({ nombre, descripcion }) {
    if (!nombre) throw new Error("El nombre del sistema es obligatorio.");
    if (!descripcion) throw new Error("La descripción es obligatoria.");
  }

  // Decodificar y validar el ID
  _validateId(encodedId) {
    try {
      return decodeId(encodedId);
    } catch {
      throw new Error("ID de sistema no válido.");
    }
  }

  // Obtener todos los sistemas
  async getAllSystems() {
    return await this.systemRepository.getAllSystems();
  }

  // Obtener sistemas paginados
  async getPaginatedSystems(limit, offset) {
    return await this.systemRepository.getPaginatedSystems(limit, offset);
  }

  // Contar el total de sistemas
  async countSystems() {
    return await this.systemRepository.countSystems();
  }

  // Obtener sistema por ID codificado
  async getSystemById(encodedId) {
    const decodedId = this._validateId(encodedId);
    return await this.systemRepository.getSystemById(decodedId);
  }

  // Crear un nuevo sistema
  async createSystem(systemData) {
    this._validateSystemData(systemData);

    if (systemData.vigente === undefined) {
      systemData.vigente = 1;
    }

    return await this.systemRepository.createSystem(systemData);
  }

  // Actualizar un sistema existente
  async updateSystem(encodedId, newSystemData) {
    const decodedId = this._validateId(encodedId);
    this._validateSystemData(newSystemData);

    return await this.systemRepository.updateSystem(decodedId, newSystemData);
  }

  // Eliminar un sistema (actualizar 'vigente' a 0)
  async deleteSystem(encodedId) {
    const decodedId = this._validateId(encodedId);
    return await this.systemRepository.deleteSystem(decodedId);
  }
}

export default new SystemService();
