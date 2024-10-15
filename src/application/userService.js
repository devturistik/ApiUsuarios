import bcrypt from "bcrypt";
import UserRepository from "../adapters/repository/userRepository.js";

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
      throw new Error("El correo debe ser un email válido.");
    }
    if (clave && clave.length < 6) {
      throw new Error("La clave debe tener al menos 6 caracteres.");
    }
  }

  // Decodifica y valida el ID
  _validateId(encodedId) {
    try {
      const decodedId = Buffer.from(encodedId, "base64").toString();
      if (isNaN(decodedId)) throw new Error("ID de usuario no válido.");
      return decodedId;
    } catch {
      throw new Error("ID de usuario no válido.");
    }
  }

  async getAllUsers() {
    return await this.userRepository.getAllUsers();
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
}

export default new UserService();
