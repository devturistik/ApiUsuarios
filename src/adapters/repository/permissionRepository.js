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
      const result = await pool
        .request()
        .query("SELECT * FROM SistemaWebOC.permisos");
      return result.recordset.map((permission) => ({
        id: Buffer.from(permission.id.toString()).toString("base64"),
        nombre: permission.nombre,
      }));
    } catch (error) {
      console.error("Error al obtener permisos:", error);
      throw error;
    }
  }

  // Obtener un permiso por su ID
  async getPermissionById(id) {
    try {
      const pool = await this.poolPromise;
      const result = await pool
        .request()
        .input("id", sql.Int, id)
        .query("SELECT * FROM SistemaWebOC.permisos WHERE id = @id");

      const permission = result.recordset[0];
      if (!permission) return null;

      return {
        id: Buffer.from(permission.id.toString()).toString("base64"),
        nombre: permission.nombre,
      };
    } catch (error) {
      console.error("Error al obtener permiso por ID:", error);
      throw error;
    }
  }

  // Crear un nuevo permiso
  async createPermission({ nombre }) {
    try {
      const pool = await this.poolPromise;

      // Verifica si el nombre del permiso ya está en uso
      const checkName = await pool
        .request()
        .input("nombre", sql.NVarChar, nombre)
        .query("SELECT id FROM SistemaWebOC.permisos WHERE nombre = @nombre");

      if (checkName.recordset.length > 0) {
        const error = new Error("El nombre ya está en uso");
        error.code = "DUPLICATE_NAME";
        throw error;
      }

      const result = await pool
        .request()
        .input("nombre", sql.NVarChar, nombre)
        .query(
          "INSERT INTO SistemaWebOC.permisos (nombre) OUTPUT INSERTED.id VALUES (@nombre)"
        );

      return result.recordset[0];
    } catch (error) {
      console.error("Error al crear permiso:", error);
      throw error;
    }
  }

  // Actualizar un permiso existente
  async updatePermission(id, { nombre }) {
    try {
      const currentPermission = await this.getPermissionById(id);
      if (!currentPermission) {
        throw new Error("Permiso no encontrado");
      }

      let query = "UPDATE SistemaWebOC.permisos SET ";
      const queryFields = [];
      const params = { id };

      if (nombre && nombre !== currentPermission.nombre) {
        queryFields.push("nombre = @nombre");
        params.nombre = nombre;
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
      console.error("Error al actualizar permiso:", error);
      throw error;
    }
  }

  // Eliminar un permiso
  async deletePermission(id) {
    try {
      const pool = await this.poolPromise;
      const result = await pool
        .request()
        .input("id", sql.Int, id)
        .query("DELETE FROM SistemaWebOC.permisos WHERE id = @id");

      return result.rowsAffected[0] > 0;
    } catch (error) {
      console.error("Error al eliminar permiso:", error);
      throw error;
    }
  }
}

export default PermissionRepository;
