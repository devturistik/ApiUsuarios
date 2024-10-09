// src/adapters/repository/userRepository.js

import sql from "mssql";
import bcrypt from "bcrypt";
import User from "../../domain/user.js";

const config = {
  user: "carriagada",
  password: "Turistik.2024.*",
  server: "turistikfi.database.windows.net",
  database: "finanzas",
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
};

export default class AuthRepository {
  constructor() {
    this.poolPromise = sql.connect(config);
  }

  async getUserById(id) {
    try {
      const pool = await this.poolPromise;
      const result = await pool
        .request()
        .input("id", sql.Int, id)
        .query("SELECT * FROM SistemaWebOC.usuarios WHERE id = @id");
      const user = result.recordset[0];
      console.log(user);
      if (user) {
        return new User(
          user.id,
          user.clave,
          user.nombre,
          user.depto,
          user.correo,
          user.rol
        );
      } else {
        throw new Error("User not found");
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      throw error;
    }
  }

  async createUser(clave, nombre, depto, correo, rol) {
    try {
      // Verificar si el correo ya existe
      const existingUser = await this.getUserByEmail(correo);
      if (existingUser) {
        // Lanzar una excepción con un código específico para indicar que el usuario ya existe
        const error = new Error("el email existe en la base de datos");
        error.code = "USER_EXISTS";
        throw error;
      }

      // Cifrar la clave antes de almacenarla
      const saltRounds = 10; // Puedes ajustar el número de rondas de sal
      const hashedPassword = await bcrypt.hash(clave, saltRounds);
      const pool = await this.poolPromise;
      const result = await pool
        .request()
        .input("clave", sql.NVarChar, hashedPassword)
        .input("nombre", sql.NVarChar, nombre)
        .input("depto", sql.NVarChar, depto)
        .input("correo", sql.NVarChar, correo)
        .input("rol", sql.NVarChar, rol)
        .query(
          "INSERT INTO SistemaWebOC.usuarios (clave, nombre, depto, correo, rol, activo) OUTPUT INSERTED.Id VALUES (@clave, @nombre, @depto, @correo, @rol, 1)"
        );
      console.log(result.recordset[0].Id);
      return result.recordset[0].Id;
    } catch (error) {
      console.error("Error inserting user:", error);
      throw error;
    }
  }

  async getUserByEmail(email) {
    try {
      const pool = await this.poolPromise;
      const result = await pool
        .request()
        .input("correo", sql.NVarChar, email)
        .query(
          "SELECT * FROM SistemaWebOC.usuarios WHERE correo = @correo AND activo = 1"
        );
      return result.recordset[0];
    } catch (error) {
      console.error("Error fetching user by email:", error);
      throw error;
    }
  }

  async verifyPassword(storedPasswordHash, password) {
    return bcrypt.compare(password, storedPasswordHash);
  }

  async loginUser(correo, clave) {
    try {
      const user = await this.getUserByEmail(correo);
      if (!user) {
        throw new Error("User not found");
      }

      const isPasswordValid = await this.verifyPassword(user.clave, clave);
      if (!isPasswordValid) {
        return res.status(200).json({ error: "Email o clave invalida" });
        //throw new Error('Invalid password');
      }

      // Autenticación exitosa, retorna el usuario u otro dato relevante
      return new User(user.Id, user.Name, user.Email);
    } catch (error) {
      console.error("Error during login:", error);
      throw error;
    }
  }

  async updateUser(id, updates) {
    try {
      const pool = await this.poolPromise;

      // Construir la consulta de actualización dinámica
      let query = "UPDATE SistemaWebOC.usuarios SET ";
      const keys = Object.keys(updates);
      const inputs = [];
      keys.forEach((key, index) => {
        query += `${key} = @param${index}, `;
        inputs.push({ name: `param${index}`, value: updates[key] });
      });
      query = query.slice(0, -2); // Eliminar la última coma y espacio
      query += " WHERE id = @id";

      const request = pool.request().input("id", sql.Int, id);
      inputs.forEach((input) => {
        request.input(input.name, sql.NVarChar, input.value); // Puedes ajustar el tipo según el campo
      });

      const result = await request.query(query);
      if (result.rowsAffected[0] === 0) {
        throw new Error("User not found");
      }

      return result.rowsAffected[0];
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  }

  async deleteUser(id) {
    try {
      const pool = await this.poolPromise;
      const result = await pool
        .request()
        .input("id", sql.Int, id)
        .query("UPDATE SistemaWebOC.usuarios SET eliminado = 1 WHERE id = @id");
      if (result.rowsAffected[0] === 0) {
        throw new Error("User not found");
      }
      return result.rowsAffected[0];
    } catch (error) {
      console.error("Error deleting user:", error);
      throw error;
    }
  }
}
