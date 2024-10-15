// src/application/permissionService.js
import PermissionRepository from "../adapters/repository/permissionRepository.js";

class PermissionService {
  constructor() {
    this.permissionRepository = new PermissionRepository();
  }

  // Validar los datos del permiso
  _validatePermissionData({ nombre }) {
    if (!nombre) throw new Error("El nombre del permiso es obligatorio.");
  }

  // Validar y decodificar el ID
  _validateId(encodedId) {
    try {
      const decodedId = Buffer.from(encodedId, "base64").toString();
      if (isNaN(decodedId)) throw new Error("ID de permiso no válido.");
      return decodedId;
    } catch {
      throw new Error("ID de permiso no válido.");
    }
  }

  // Obtener todos los permisos
  async getAllPermissions() {
    return await this.permissionRepository.getAllPermissions();
  }

  // Obtener un permiso por su ID codificado
  async getPermissionById(encodedId) {
    const decodedId = this._validateId(encodedId);
    return await this.permissionRepository.getPermissionById(decodedId);
  }

  // Crear un nuevo permiso
  async createPermission(permissionData) {
    this._validatePermissionData(permissionData);
    const nuevoPermiso = { ...permissionData };
    return await this.permissionRepository.createPermission(nuevoPermiso);
  }

  // Actualizar un permiso existente
  async updatePermission(encodedId, newPermissionData) {
    const decodedId = this._validateId(encodedId);
    this._validatePermissionData(newPermissionData);

    return await this.permissionRepository.updatePermission(
      decodedId,
      newPermissionData
    );
  }

  // Eliminar un permiso por ID codificado
  async deletePermission(encodedId) {
    const decodedId = this._validateId(encodedId);
    return await this.permissionRepository.deletePermission(decodedId);
  }
}

export default new PermissionService();
