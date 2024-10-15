// src/application/roleService.js
import RoleRepository from "../adapters/repository/roleRepository.js";

class RoleService {
  constructor() {
    this.roleRepository = new RoleRepository();
  }

  // Validar los datos del rol
  _validateRoleData({ nombre, nivel_jerarquia }) {
    if (!nombre) throw new Error("El nombre del rol es obligatorio.");
    if (!nivel_jerarquia) throw new Error("El nivel de jerarquia del rol es obligatoria.");
  }

  // Validar y decodificar el ID
  _validateId(encodedId) {
    try {
      const decodedId = Buffer.from(encodedId, "base64").toString();
      if (isNaN(decodedId)) throw new Error("ID de rol no válido.");
      return decodedId;
    } catch {
      throw new Error("ID de rol no válido.");
    }
  }

  // Obtener todos los roles
  async getAllRoles() {
    return await this.roleRepository.getAllRoles();
  }

  // Obtener un rol por su ID codificado
  async getRoleById(encodedId) {
    const decodedId = this._validateId(encodedId);
    return await this.roleRepository.getRoleById(decodedId);
  }

  // Crear un nuevo rol
  async createRole(roleData) {
    this._validateRoleData(roleData);
    const nuevoRol = { ...roleData };
    return await this.roleRepository.createRole(nuevoRol);
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
}

export default new RoleService();
