// src/application/roleService.js
import RoleRepository from "../adapters/repository/roleRepository.js";
import permissionService from "./permissionService.js";
import { decodeId } from "../utils/idEncoder.js";

class RoleService {
  constructor() {
    this.roleRepository = new RoleRepository();
  }

  // Validar los datos del rol
  _validateRoleData({ nombre, nivel_jerarquia }) {
    if (!nombre) throw new Error("El nombre del rol es obligatorio.");
    if (
      nivel_jerarquia === undefined ||
      nivel_jerarquia === null ||
      isNaN(nivel_jerarquia) ||
      nivel_jerarquia <= 0
    ) {
      throw new Error(
        "El nivel de jerarquía es obligatorio y debe ser un número entero positivo."
      );
    }
  }

  // Validar y decodificar el ID
  _validateId(encodedId) {
    try {
      return decodeId(encodedId);
    } catch {
      throw new Error("ID de rol no válido.");
    }
  }

  // Obtener todos los roles
  async getAllRoles() {
    return await this.roleRepository.getAllRoles();
  }

  // Obtener roles paginados
  async getPaginatedRoles(limit, offset) {
    return await this.roleRepository.getPaginatedRoles(limit, offset);
  }

  // Contar el total de roles
  async countRoles() {
    return await this.roleRepository.countRoles();
  }

  // Obtener un rol por su ID codificado
  async getRoleById(encodedId) {
    const decodedId = this._validateId(encodedId);
    return await this.roleRepository.getRoleById(decodedId);
  }

  // Crear un nuevo rol
  async createRole(roleData) {
    this._validateRoleData(roleData);
    return await this.roleRepository.createRole(roleData);
  }

  // Actualizar un rol existente
  async updateRole(encodedId, newRoleData) {
    const decodedId = this._validateId(encodedId);
    this._validateRoleData(newRoleData);

    return await this.roleRepository.updateRole(decodedId, newRoleData);
  }

  // Eliminar un rol por ID codificado
  async deleteRole(encodedId) {
    const decodedId = this._validateId(encodedId);
    return await this.roleRepository.deleteRole(decodedId);
  }

  async getRolesByUserId(encodedId) {
    const decodedId = this._validateId(encodedId);
    return await this.roleRepository.getRolesByUserId(decodedId);
  }

  // Asignar un permiso a un rol
  async assignPermissionToRole(encodedRoleId, encodedPermisoId) {
    const roleId = this._validateId(encodedRoleId);
    const permisoId = this._validateId(encodedPermisoId);

    // Verificar que el permiso y el rol existen
    const permiso = await permissionService.getPermissionById(encodedPermisoId);
    const rol = await this.getRoleById(encodedRoleId);

    if (!permiso) throw new Error("Permiso no encontrado");
    if (!rol) throw new Error("Rol no encontrado");

    // Llamar al repositorio para asignar el permiso al rol
    return await this.roleRepository.assignPermissionToRole(roleId, permisoId);
  }
}

export default new RoleService();
