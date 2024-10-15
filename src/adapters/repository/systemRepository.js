// src/adapters/repository/systemRepository.js
import sql from "mssql";
import config from "../../config/database.js";

export default class SystemRepository {
  constructor() {
    this.poolPromise = sql.connect(config);
  }

  // Obtener todos los sistemas
  async getAllSystems() {
    try {
      const pool = await this.poolPromise;
      const result = await pool
        .request()
        .query("SELECT * FROM SistemaWebOC.sistema");
      return result.recordset.map((system) => ({
        id: Buffer.from(system.id.toString()).toString("base64"),
        nombre: system.nombre,
        descripcion: system.descripcion,
      }));
    } catch (error) {
      console.error("Error al obtener sistemas:", error);
      throw error;
    }
  }

  // Obtener un sistema por su ID
  async getSystemById(id) {
    try {
      const pool = await this.poolPromise;
      const result = await pool
        .request()
        .input("id", sql.Int, id)
        .query("SELECT * FROM SistemaWebOC.sistema WHERE id = @id");

      const system = result.recordset[0];
      if (!system) return null;

      return {
        id: Buffer.from(system.id.toString()).toString("base64"),
        nombre: system.nombre,
        descripcion: system.descripcion,
      };
    } catch (error) {
      console.error("Error al obtener sistema por ID:", error);
      throw error;
    }
  }

  // Crear un nuevo sistema en la base de datos
  async createSystem({ nombre, descripcion }) {
    try {
      const pool = await this.poolPromise;

      // Verifica si el nombre del sistema ya está en uso
      const checkName = await pool
        .request()
        .input("nombre", sql.NVarChar, nombre)
        .query("SELECT id FROM SistemaWebOC.sistema WHERE nombre = @nombre");

      if (checkName.recordset.length > 0) {
        const error = new Error("El nombre ya está en uso");
        error.code = "DUPLICATE_NAME";
        throw error;
      }

      const result = await pool
        .request()
        .input("nombre", sql.NVarChar, nombre)
        .input("descripcion", sql.NVarChar, descripcion)
        .query(
          "INSERT INTO SistemaWebOC.sistema (nombre, descripcion) OUTPUT INSERTED.id VALUES (@nombre, @descripcion)"
        );

      return result.recordset[0];
    } catch (error) {
      console.error("Error al crear sistema:", error);
      throw error;
    }
  }

  // Actualizar un sistema existente
  async updateSystem(id, { nombre, descripcion }) {
    try {
      const currentSystem = await this.getSystemById(id);
      if (!currentSystem) {
        throw new Error("Sistema no encontrado");
      }

      let query = "UPDATE SistemaWebOC.sistema SET ";
      const queryFields = [];
      const params = { id };

      if (nombre && nombre !== currentSystem.nombre) {
        queryFields.push("nombre = @nombre");
        params.nombre = nombre;
      }
      if (descripcion && descripcion !== currentSystem.descripcion) {
        queryFields.push("descripcion = @descripcion");
        params.descripcion = descripcion;
      }

      if (!queryFields.length) return false;

      query += queryFields.join(", ") + " WHERE id = @id";
      const pool = await this.poolPromise;
      const updateRequest = pool.request();

      Object.keys(params).forEach((key) => {
        updateRequest.input(key, params[key]);
      });

      const result = await updateRequest.query(query);
      return result.rowsAffected[0] > 0;
    } catch (error) {
      console.error("Error al actualizar sistema:", error);
      throw error;
    }
  }

  // Eliminar un sistema
  async deleteSystem(id) {
    try {
      const pool = await this.poolPromise;
      const result = await pool
        .request()
        .input("id", sql.Int, id)
        .query("DELETE FROM SistemaWebOC.sistema WHERE id = @id");

      return result.rowsAffected[0] > 0;
    } catch (error) {
      console.error("Error al eliminar sistema:", error);
      throw error;
    }
  }
}
