// src/adapters/repository/authRepository.js
import sql from "mssql";
import config from "../../config/database.js";
import User from "../../domain/userToken.js";

export default class AuthRepository {
  constructor() {
    this.poolPromise = sql.connect(config); // Conexión a la BD
  }

  // Obtiene usuario por correo
  async getUserByUserName(username) {
    try {
      const pool = await this.poolPromise;
      const result = await pool
        .request()
        .input("username", sql.NVarChar, username)
        .query("SELECT * FROM SistemaWebOC.usuariosToken WHERE username = @username");

      const user = result.recordset[0];
      return user ? new User(user) : null;
    } catch (error) {
      console.error("Error fetching user by username:", error);
      throw error;
    }
  }
}
