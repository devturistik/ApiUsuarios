// src/adapters/repository/roleRepository.js
import sql from "mssql";
import config from "../../config/database.js";

class RoleRepository {
  constructor() {
    this.poolPromise = sql.connect(config);
  }

  // Obtener todos los roles
  async getAllRoles() {
    try {
      const pool = await this.poolPromise;
      const result = await pool
        .request()
        .query("SELECT * FROM SistemaWebOC.roles");
      return result.recordset.map((role) => ({
        id: Buffer.from(role.id.toString()).toString("base64"),
        nombre: role.nombre,
        nivel_jerarquia: role.nivel_jerarquia,
      }));
    } catch (error) {
      console.error("Error al obtener roles:", error);
      throw error;
    }
  }

  // Obtener un rol por su ID
  async getRoleById(id) {
    try {
      const pool = await this.poolPromise;
      const result = await pool
        .request()
        .input("id", sql.Int, id)
        .query("SELECT * FROM SistemaWebOC.roles WHERE id = @id");

      const role = result.recordset[0];
      if (!role) return null;

      return {
        id: Buffer.from(role.id.toString()).toString("base64"),
        nombre: role.nombre,
        nivel_jerarquia: role.nivel_jerarquia,
      };
    } catch (error) {
      console.error("Error al obtener rol por ID:", error);
      throw error;
    }
  }

  // Crear un nuevo rol
  async createRole({ nombre, nivel_jerarquia }) {
    try {
      const pool = await this.poolPromise;

      // Verifica si el nombre del rol ya está en uso
      const checkName = await pool
        .request()
        .input("nombre", sql.NVarChar, nombre)
        .query("SELECT id FROM SistemaWebOC.roles WHERE nombre = @nombre");

      if (checkName.recordset.length > 0) {
        const error = new Error("El nombre ya está en uso");
        error.code = "DUPLICATE_NAME";
        throw error;
      }

      const result = await pool
        .request()
        .input("nombre", sql.NVarChar, nombre)
        .input("nivel_jerarquia", sql.NVarChar, nivel_jerarquia)
        .query(
          "INSERT INTO SistemaWebOC.roles (nombre, nivel_jerarquia) OUTPUT INSERTED.id VALUES (@nombre, @nivel_jerarquia)"
        );

      return result.recordset[0];
    } catch (error) {
      console.error("Error al crear rol:", error);
      throw error;
    }
  }

  // Actualizar un rol existente
  async updateRole(id, { nombre, nivel_jerarquia }) {
    try {
      const currentRole = await this.getRoleById(id);
      if (!currentRole) {
        throw new Error("Rol no encontrado");
      }

      let query = "UPDATE SistemaWebOC.roles SET ";
      const queryFields = [];
      const params = { id };

      if (nombre && nombre !== currentRole.nombre) {
        queryFields.push("nombre = @nombre");
        params.nombre = nombre;
      }
      if (nivel_jerarquia && nivel_jerarquia !== currentRole.nivel_jerarquia) {
        queryFields.push("nivel_jerarquia = @nivel_jerarquia");
        params.nivel_jerarquia = nivel_jerarquia;
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
      console.error("Error al actualizar rol:", error);
      throw error;
    }
  }

  // Eliminar un rol
  async deleteRole(id) {
    try {
      const pool = await this.poolPromise;
      const result = await pool
        .request()
        .input("id", sql.Int, id)
        .query("DELETE FROM SistemaWebOC.roles WHERE id = @id");

      return result.rowsAffected[0] > 0;
    } catch (error) {
      console.error("Error al eliminar rol:", error);
      throw error;
    }
  }
}

export default RoleRepository;
