// src/domain/userToken.js
import bcrypt from "bcrypt"; // Asegúrate de importar bcrypt

export default class UserToken {
  constructor({
    id,
    username,
    pass, // Mantener el nombre como 'pass'
    scope,
    activo,
  }) {
    this.id = id;
    this.username = username;
    this.pass = pass; // Asignar correctamente 'pass'
    this.scope = scope;
    this.activo = activo;
  }

  // Verificación de contraseña
  async verifyPassword(password) {
    return bcrypt.compare(password, this.pass); // Comparar con 'pass'
  }
}
