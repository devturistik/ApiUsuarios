// src/adapters/repository/authRepository.js
import sql from "mssql";
import config from "../../config/database.js";
import userService from "../../application/userService.js";
import User from "../../domain/user.js";

export default class AuthRepository {
  constructor() {
    this.poolPromise = sql.connect(config);
  }

  // Obtiene usuario por correo
  async getUserByEmail(email) {
    try {
      const pool = await this.poolPromise;
      const result = await pool
        .request()
        .input("correo", sql.NVarChar, email)
        .query(
          "SELECT id FROM centralusuarios.usuarios WHERE correo = @correo"
        );

      const user = result.recordset[0];

      if (user) {
        // Convertir el ID en Base64
        const encodedId = Buffer.from(user.id.toString()).toString("base64");

        const usuario = await userService.APIget(encodedId);

        return usuario[0];
      } else {
        return null;
      }
    } catch (error) {
      console.error("Error fetching user by email:", error);
      throw error;
    }
  }
}
