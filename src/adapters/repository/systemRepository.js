// src/adapters/repository/systemRepository.js
import sql from "mssql";
import config from "../../config/database.js";

class SystemRepository {
  constructor() {
    this.poolPromise = sql.connect(config);
  }

  // Obtener todos los sistemas que están vigentes
  async getAllSystems() {
    try {
      const pool = await this.poolPromise;
      const result = await pool.request().query(`
        SELECT id, nombre, descripcion, eliminado
        FROM centralusuarios.sistemas
        WHERE eliminado = 0
      `);
      return result.recordset.map((system) => ({
        id: Buffer.from(system.id.toString()).toString("base64"),
        nombre: system.nombre,
        descripcion: system.descripcion,
        eliminado: Boolean(system.eliminado),
      }));
    } catch (error) {
      console.error("Error al obtener sistemas:", error);
      throw error;
    }
  }

  // Obtener sistemas paginados que están vigentes
  async getPaginatedSystems(limit, offset) {
    try {
      const pool = await this.poolPromise;
      const result = await pool
        .request()
        .input("limit", sql.Int, limit)
        .input("offset", sql.Int, offset).query(`
          SELECT id, nombre, descripcion, eliminado
          FROM centralusuarios.sistemas
          WHERE eliminado = 0
          ORDER BY id
          OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY;
        `);

      return result.recordset.map((row) => ({
        id: Buffer.from(row.id.toString()).toString("base64"),
        nombre: row.nombre,
        descripcion: row.descripcion,
        eliminado: Boolean(row.eliminado),
      }));
    } catch (error) {
      console.error("Error al obtener sistemas paginados:", error);
      throw error;
    }
  }

  // Contar el total de sistemas vigentes
  async countSystems() {
    try {
      const pool = await this.poolPromise;
      const result = await pool.request().query(`
        SELECT COUNT(*) as total
        FROM centralusuarios.sistemas
        WHERE eliminado = 0;
      `);

      return result.recordset[0].total;
    } catch (error) {
      console.error("Error al contar sistemas:", error);
      throw error;
    }
  }

  // Obtener un sistema por su ID
  async getSystemById(id) {
    try {
      const pool = await this.poolPromise;
      const result = await pool.request().input("id", sql.Int, id).query(`
          SELECT id, nombre, descripcion, eliminado
          FROM centralusuarios.sistemas
          WHERE id = @id
        `);

      const system = result.recordset[0];
      if (!system) return null;

      return {
        id: Buffer.from(system.id.toString()).toString("base64"),
        nombre: system.nombre,
        descripcion: system.descripcion,
        eliminado: Boolean(system.eliminado),
      };
    } catch (error) {
      console.error("Error al obtener sistema por ID:", error);
      throw error;
    }
  }

  // Crear un nuevo sistema en la base de datos
  async createSystem({ nombre, descripcion, eliminado }) {
    try {
      const pool = await this.poolPromise;

      // Verificar si el nombre del sistema ya está en uso
      const checkName = await pool
        .request()
        .input("nombre", sql.NVarChar, nombre).query(`
          SELECT id FROM centralusuarios.sistemas
          WHERE nombre = @nombre
        `);

      if (checkName.recordset.length > 0) {
        throw new Error("El nombre del sistema ya está en uso");
      }

      const result = await pool
        .request()
        .input("nombre", sql.NVarChar, nombre)
        .input("descripcion", sql.NVarChar, descripcion)
        .input("eliminado", sql.Int, eliminado).query(`
          INSERT INTO centralusuarios.sistemas (nombre, descripcion, eliminado)
          OUTPUT INSERTED.id
          VALUES (@nombre, @descripcion, @eliminado)
        `);

      return result.recordset[0];
    } catch (error) {
      console.error("Error al crear sistema:", error);
      throw error;
    }
  }

  // Actualizar un sistema existente
  async updateSystem(id, data) {
    try {
      const pool = await this.poolPromise;
      const updateRequest = pool.request().input("id", sql.Int, id);

      const fields = [];
      if (data.nombre !== undefined) {
        fields.push("nombre = @nombre");
        updateRequest.input("nombre", sql.NVarChar, data.nombre);
      }
      if (data.descripcion !== undefined) {
        fields.push("descripcion = @descripcion");
        updateRequest.input("descripcion", sql.NVarChar, data.descripcion);
      }

      if (fields.length === 0) return false;

      const query = `UPDATE centralusuarios.sistemas SET ${fields.join(
        ", "
      )} WHERE id = @id`;

      const result = await updateRequest.query(query);
      return result.rowsAffected[0] > 0;
    } catch (error) {
      console.error("Error al actualizar sistema:", error);
      throw error;
    }
  }

  // Eliminar un sistema (actualizar 'eliminado' a 1)
  async deleteSystem(id) {
    try {
      const pool = await this.poolPromise;
      const result = await pool.request().input("id", sql.Int, id).query(`
          UPDATE centralusuarios.sistemas
          SET eliminado = 1
          WHERE id = @id
        `);

      return result.rowsAffected[0] > 0;
    } catch (error) {
      console.error("Error al eliminar sistema:", error);
      throw error;
    }
  }
}

export default SystemRepository;
