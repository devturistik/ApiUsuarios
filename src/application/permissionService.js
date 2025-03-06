// src/application/permissionService.js
import PermissionRepository from "../adapters/repository/permissionRepository.js";
import roleService from "./roleService.js";
import { decodeId } from "../utils/idEncoder.js";

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
      return decodeId(encodedId);
    } catch {
      throw new Error("ID de permiso no válido.");
    }
  }

  // Obtener todos los permisos
  async getAllPermissions() {
    return await this.permissionRepository.getAllPermissions();
  }

  // Obtener permisos paginados
  async getPaginatedPermissions(limit, offset) {
    return await this.permissionRepository.getPaginatedPermissions(
      limit,
      offset
    );
  }

  // Contar el total de permisos
  async countPermissions() {
    return await this.permissionRepository.countPermissions();
  }

  // Obtener un permiso por su ID codificado
  async getPermissionById(encodedId) {
    const decodedId = this._validateId(encodedId);
    return await this.permissionRepository.getPermissionById(decodedId);
  }

  // Crear un nuevo permiso
  async createPermission(permissionData) {
    this._validatePermissionData(permissionData);
    return await this.permissionRepository.createPermission(permissionData);
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
