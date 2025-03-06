// src/adapters/repository/permissionRepository.js
import sql from "mssql";
import config from "../../config/database.js";

class PermissionRepository {
  constructor() {
    this.poolPromise = sql.connect(config);
  }

  // Obtener todos los permisos
  async getAllPermissions() {
    try {
      const pool = await this.poolPromise;
      const result = await pool.request().query(`
        SELECT id, nombre, created_by, updated_by
        FROM centralusuarios.permisos
      `);
      return result.recordset.map((permission) => ({
        id: Buffer.from(permission.id.toString()).toString("base64"),
        nombre: permission.nombre,
        created_by: permission.created_by,
        updated_by: permission.updated_by,
      }));
    } catch (error) {
      console.error("Error al obtener permisos:", error);
      throw error;
    }
  }

  // Obtener permisos paginados
  async getPaginatedPermissions(limit, offset) {
    try {
      const pool = await this.poolPromise;
      const result = await pool
        .request()
        .input("limit", sql.Int, limit)
        .input("offset", sql.Int, offset).query(`
          SELECT id, nombre, created_by, updated_by
          FROM centralusuarios.permisos
          ORDER BY id
          OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY;
        `);

      // Procesar el recordset para codificar el ID en Base64
      const permisos = result.recordset.map((row) => {
        const encodedId = Buffer.from(row.id.toString()).toString("base64");
        return {
          id: encodedId,
          nombre: row.nombre,
          created_by: row.created_by,
          updated_by: row.updated_by,
        };
      });

      return permisos;
    } catch (error) {
      console.error("Error al obtener permisos paginados:", error);
      throw error;
    }
  }

  // Contar el total de permisos
  async countPermissions() {
    try {
      const pool = await this.poolPromise;
      const result = await pool.request().query(`
        SELECT COUNT(*) as total
        FROM centralusuarios.permisos
      `);

      return result.recordset[0].total;
    } catch (error) {
      console.error("Error al contar permisos:", error);
      throw error;
    }
  }

  // Obtener un permiso por su ID
  async getPermissionById(id) {
    try {
      const pool = await this.poolPromise;
      const result = await pool.request().input("id", sql.Int, id).query(`
          SELECT id, nombre, created_by, updated_by
          FROM centralusuarios.permisos
          WHERE id = @id
        `);

      const permission = result.recordset[0];
      if (!permission) return null;

      return {
        id: Buffer.from(permission.id.toString()).toString("base64"),
        nombre: permission.nombre,
        created_by: permission.created_by,
        updated_by: permission.updated_by,
      };
    } catch (error) {
      console.error("Error al obtener permiso por ID:", error);
      throw error;
    }
  }

  // Crear un nuevo permiso
  async createPermission({ nombre, created_by }) {
    try {
      const pool = await this.poolPromise;

      // Verifica si el nombre del permiso ya está en uso
      const checkName = await pool
        .request()
        .input("nombre", sql.NVarChar, nombre).query(`
          SELECT id FROM centralusuarios.permisos WHERE nombre = @nombre
        `);

      if (checkName.recordset.length > 0) {
        throw new Error("El nombre del permiso ya está en uso");
      }

      const result = await pool
        .request()
        .input("nombre", sql.NVarChar, nombre)
        .input("created_by", sql.Int, created_by).query(`
          INSERT INTO centralusuarios.permisos (nombre, created_by)
          OUTPUT INSERTED.id
          VALUES (@nombre, @created_by)
        `);

      return result.recordset[0];
    } catch (error) {
      console.error("Error al crear permiso:", error);
      throw error;
    }
  }

  // Actualizar un permiso existente
  async updatePermission(id, { nombre, updated_by }) {
    try {
      const pool = await this.poolPromise;
      const updateRequest = pool.request().input("id", sql.Int, id);

      const fields = [];
      if (nombre !== undefined) {
        fields.push("nombre = @nombre");
        updateRequest.input("nombre", sql.NVarChar, nombre);
      }
      if (updated_by !== undefined) {
        fields.push("updated_by = @updated_by");
        updateRequest.input("updated_by", sql.Int, updated_by);
      }

      if (fields.length === 0) return false;

      const query = `UPDATE centralusuarios.permisos SET ${fields.join(
        ", "
      )} WHERE id = @id`;

      const result = await updateRequest.query(query);
      return result.rowsAffected[0] > 0;
    } catch (error) {
      console.error("Error al actualizar permiso:", error);
      throw error;
    }
  }

  // Eliminar un permiso
  async deletePermission(id) {
    try {
      const pool = await this.poolPromise;
      const result = await pool.request().input("id", sql.Int, id).query(`
          DELETE FROM centralusuarios.permisos WHERE id = @id
        `);

      return result.rowsAffected[0] > 0;
    } catch (error) {
      console.error("Error al eliminar permiso:", error);
      throw error;
    }
  }
}

export default PermissionRepository;
