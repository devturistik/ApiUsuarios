// src/application/userService.js
import bcrypt from "bcrypt";
import UserRepository from "../adapters/repository/userRepository.js";
import systemService from "./systemService.js";
import roleService from "./roleService.js";
import { decodeId } from "../utils/idEncoder.js";

class UserService {
  constructor() {
    this.userRepository = new UserRepository();
  }

  // Validación de datos del usuario
  _validateUserData({ nombre, apellido, departamento, correo, clave }) {
    if (!nombre) throw new Error("El nombre es obligatorio.");
    if (!apellido) throw new Error("El apellido es obligatorio.");
    if (!departamento) throw new Error("El departamento es obligatorio.");
    if (!correo || !/\S+@\S+\.\S+/.test(correo)) {
      throw new Error("El correo debe ser válido.");
    }
    if (clave && clave.trim() !== "" && clave.length < 6) {
      throw new Error("La clave debe tener al menos 6 caracteres.");
    }
  }

  // Decodifica y valida el ID
  _validateId(encodedId) {
    try {
      return decodeId(encodedId);
    } catch {
      throw new Error("ID de usuario no válido.");
    }
  }

  // Obtener todos los usuarios
  async APIget(...encodedId) {
    if (encodedId.length > 0) {
      const decodedId = this._validateId(encodedId[0]);
      return await this.userRepository.APIget(decodedId);
    }
    return await this.userRepository.APIget();
  }

  // Obtener usuarios paginados con filtros
  async getPaginatedUsers(limit, offset, departamento, estado, search) {
    return await this.userRepository.getPaginatedUsers(
      limit,
      offset,
      departamento,
      estado,
      search
    );
  }

  // Contar el total de usuarios con filtros
  async countUsers(departamento, estado, search) {
    return await this.userRepository.countUsers(departamento, estado, search);
  }

  // Contar usuarios por estado
  async countUsersByEstado(estado) {
    return await this.userRepository.countUsersByEstado(estado);
  }

  // Obtiene un usuario por su ID decodificado
  async getUserById(encodedId) {
    const decodedId = this._validateId(encodedId);
    return await this.userRepository.getUserById(decodedId);
  }

  // Crea un nuevo usuario con la contraseña hasheada
  async createUser(userData) {
    this._validateUserData(userData);
    userData.clave = await this._hashPassword(userData.clave);
    return await this.userRepository.createUser(userData);
  }

  // Actualiza un usuario existente
  async updateUser(encodedId, newUserData) {
    const decodedId = this._validateId(encodedId);
    this._validateUserData(newUserData);

    if (newUserData.clave) {
      newUserData.clave = await this._hashPassword(newUserData.clave);
    } else {
      delete newUserData.clave;
    }

    return await this.userRepository.updateUser(decodedId, newUserData);
  }

  async deleteUser(encodedId) {
    const decodedId = this._validateId(encodedId);
    return await this.userRepository.deleteUser(decodedId);
  }

  async _hashPassword(password) {
    return await bcrypt.hash(password, 10);
  }

  // Asignar un sistema y rol a un usuario
  async assignUserToSystemRole(userEncodedId, systemEncodedId, roleEncodedId) {
    const userId = this._validateId(userEncodedId);
    const systemId = this._validateId(systemEncodedId);
    const roleId = this._validateId(roleEncodedId);

    // Verificar que el usuario, sistema y rol existen
    const user = await this.getUserById(userEncodedId);
    const system = await systemService.getSystemById(systemEncodedId);
    const role = await roleService.getRoleById(roleEncodedId);

    if (!user) throw new Error("Usuario no encontrado");
    if (!system) throw new Error("Sistema no encontrado");
    if (!role) throw new Error("Rol no encontrado");

    // Llamar al repositorio para asignar el sistema y rol al usuario
    return await this.userRepository.assignUserToSystemRole(
      userId,
      systemId,
      roleId
    );
  }

  // Obtener sistemas, roles y permisos asignados a un usuario
  async getUserSystemsRolesPermissions(encodedUserId) {
    const userId = this._validateId(encodedUserId);
    const data = await this.userRepository.getUserSystemsRolesPermissions(
      userId
    );

    // Estructurar los datos en un formato adecuado para la vista
    const systems = {};

    data.forEach((item) => {
      const sistemaId = item.sistema_id;
      if (!systems[sistemaId]) {
        systems[sistemaId] = {
          id: sistemaId,
          nombre: item.sistema_nombre,
          roles: {},
        };
      }

      const roles = systems[sistemaId].roles;
      const rolId = item.rol_id;
      if (!roles[rolId]) {
        roles[rolId] = {
          id: rolId,
          nombre: item.rol_nombre,
          permisos: [],
        };
      }

      const permisos = roles[rolId].permisos;
      if (item.permiso_id) {
        permisos.push({
          id: item.permiso_id,
          nombre: item.permiso_nombre,
        });
      }
    });

    // Convertir el objeto de sistemas a un array
    return Object.values(systems).map((system) => {
      system.roles = Object.values(system.roles);
      return system;
    });
  }

  // Obtener asignaciones paginadas de sistemas, roles y permisos para un usuario con filtros
  async getUserSystemsRolesPermissionsPaginated(
    encodedUserId,
    limit,
    offset,
    sistemaFilter,
    rolFilter,
    searchValue
  ) {
    const userId = this._validateId(encodedUserId);
    return await this.userRepository.getUserSystemsRolesPermissionsPaginated(
      userId,
      limit,
      offset,
      sistemaFilter,
      rolFilter,
      searchValue
    );
  }

  // Contar el total de asignaciones de un usuario con filtros
  async countUserAssignments(
    encodedUserId,
    sistemaFilter,
    rolFilter,
    searchValue
  ) {
    const userId = this._validateId(encodedUserId);
    return await this.userRepository.countUserAssignments(
      userId,
      sistemaFilter,
      rolFilter,
      searchValue
    );
  }

  // Eliminar una asignación de sistema y rol al usuario
  async removeUserSystemRoleAssignment(
    encodedUserId,
    encodedSystemId,
    encodedRoleId
  ) {
    const userId = this._validateId(encodedUserId);
    const systemId = this._validateId(encodedSystemId);
    const roleId = this._validateId(encodedRoleId);

    return await this.userRepository.removeUserSystemRoleAssignment(
      userId,
      systemId,
      roleId
    );
  }
}

export default new UserService();
