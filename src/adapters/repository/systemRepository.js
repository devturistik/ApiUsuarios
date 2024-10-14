// src/adapters/repository/systemRepository.js
import sql from "mssql";
import System from "../../domain/system.js";
import config from "../../config/database.js";

// Clase que maneja las operaciones CRUD con la base de datos para "sistemas"
export default class SystemRepository {
  constructor() {
    this.poolPromise = sql.connect(config); // Conexión con la base de datos
  }

  // Obtener todos los sistemas
  async getAllSystems() {
    try {
      const pool = await this.poolPromise;
      const result = await pool
        .request()
        .query("SELECT * FROM SistemaWebOC.sistema");
      return result.recordset.map((system) => ({
        id: Buffer.from(system.id.toString()).toString("base64"), // Codifica ID
        nombre: system.nombre,
        descripcion: system.descripcion,
      }));
    } catch (error) {
      console.error("Error fetching all systems:", error);
      throw error;
    }
  }

  // Obtener un sistema por su ID
  async getSystemById(id) {
    const pool = await this.poolPromise;
    const result = await pool
      .request()
      .input("id", sql.Int, id)
      .query("SELECT * FROM SistemaWebOC.sistema WHERE id = @id");
    return result.recordset[0]
      ? new System(
          result.recordset[0].id,
          result.recordset[0].nombre,
          result.recordset[0].descripcion
        )
      : null;
  }

  // Crear un nuevo sistema en la base de datos
  async createSystem(nombre, descripcion) {
    const pool = await this.poolPromise;
    const result = await pool
      .request()
      .input("nombre", sql.VarChar, nombre)
      .input("descripcion", sql.VarChar, descripcion)
      .query(
        "INSERT INTO SistemaWebOC.sistema (nombre, descripcion) OUTPUT INSERTED.id VALUES (@nombre, @descripcion)"
      );
    return result.recordset[0].id;
  }

  // Actualizar un sistema existente
  async updateSystem(id, updates) {
    const pool = await this.poolPromise;
    await pool
      .request()
      .input("id", sql.Int, id)
      .input("nombre", sql.VarChar, updates.nombre)
      .input("descripcion", sql.VarChar, updates.descripcion)
      .query(
        "UPDATE SistemaWebOC.sistema SET nombre = @nombre, descripcion = @descripcion WHERE id = @id"
      );
  }

  // Eliminar un sistema por su ID
  async deleteSystem(id) {
    const pool = await this.poolPromise;
    await pool
      .request()
      .input("id", sql.Int, id)
      .query("DELETE FROM SistemaWebOC.sistema WHERE id = @id");
  }
}
