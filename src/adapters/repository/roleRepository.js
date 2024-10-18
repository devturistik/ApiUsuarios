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
      const result = await pool.request().query(`
        SELECT id, nombre, nivel_jerarquia, created_by, updated_by
        FROM SistemaWebOC.roles
      `);
      return result.recordset.map((role) => ({
        id: Buffer.from(role.id.toString()).toString("base64"),
        nombre: role.nombre,
        nivel_jerarquia: role.nivel_jerarquia,
        created_by: role.created_by,
        updated_by: role.updated_by,
      }));
    } catch (error) {
      console.error("Error al obtener roles:", error);
      throw error;
    }
  }

  // Obtener roles paginados
  async getPaginatedRoles(limit, offset) {
    try {
      const pool = await this.poolPromise;
      const result = await pool
        .request()
        .input("limit", sql.Int, limit)
        .input("offset", sql.Int, offset).query(`
          SELECT id, nombre, nivel_jerarquia, created_by, updated_by
          FROM SistemaWebOC.roles
          ORDER BY id
          OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY;
        `);

      return result.recordset.map((row) => ({
        id: Buffer.from(row.id.toString()).toString("base64"),
        nombre: row.nombre,
        nivel_jerarquia: row.nivel_jerarquia,
        created_by: row.created_by,
        updated_by: row.updated_by,
      }));
    } catch (error) {
      console.error("Error al obtener roles paginados:", error);
      throw error;
    }
  }

  // Contar el total de roles
  async countRoles() {
    try {
      const pool = await this.poolPromise;
      const result = await pool.request().query(`
        SELECT COUNT(*) as total
        FROM SistemaWebOC.roles
      `);

      return result.recordset[0].total;
    } catch (error) {
      console.error("Error al contar roles:", error);
      throw error;
    }
  }

  // Obtener un rol por su ID
  async getRoleById(id) {
    try {
      const pool = await this.poolPromise;
      const result = await pool.request().input("id", sql.Int, id).query(`
          SELECT id, nombre, nivel_jerarquia, created_by, updated_by
          FROM SistemaWebOC.roles
          WHERE id = @id
        `);

      const role = result.recordset[0];
      if (!role) return null;

      return {
        id: Buffer.from(role.id.toString()).toString("base64"),
        nombre: role.nombre,
        nivel_jerarquia: role.nivel_jerarquia,
        created_by: role.created_by,
        updated_by: role.updated_by,
      };
    } catch (error) {
      console.error("Error al obtener rol por ID:", error);
      throw error;
    }
  }

  // Crear un nuevo rol
  async createRole({ nombre, nivel_jerarquia, created_by }) {
    try {
      const pool = await this.poolPromise;

      // Verificar si el nombre del rol ya está en uso
      const checkName = await pool
        .request()
        .input("nombre", sql.NVarChar, nombre).query(`
          SELECT id FROM SistemaWebOC.roles WHERE nombre = @nombre
        `);

      if (checkName.recordset.length > 0) {
        throw new Error("El nombre del rol ya está en uso");
      }

      const result = await pool
        .request()
        .input("nombre", sql.NVarChar, nombre)
        .input("nivel_jerarquia", sql.Int, nivel_jerarquia)
        .input("created_by", sql.Int, created_by).query(`
          INSERT INTO SistemaWebOC.roles (nombre, nivel_jerarquia, created_by)
          OUTPUT INSERTED.id
          VALUES (@nombre, @nivel_jerarquia, @created_by)
        `);

      return result.recordset[0];
    } catch (error) {
      console.error("Error al crear rol:", error);
      throw error;
    }
  }

  // Actualizar un rol existente
  async updateRole(id, { nombre, nivel_jerarquia, updated_by }) {
    try {
      const pool = await this.poolPromise;
      const updateRequest = pool.request().input("id", sql.Int, id);

      const fields = [];
      if (nombre !== undefined) {
        fields.push("nombre = @nombre");
        updateRequest.input("nombre", sql.NVarChar, nombre);
      }
      if (nivel_jerarquia !== undefined) {
        fields.push("nivel_jerarquia = @nivel_jerarquia");
        updateRequest.input("nivel_jerarquia", sql.Int, nivel_jerarquia);
      }
      if (updated_by !== undefined) {
        fields.push("updated_by = @updated_by");
        updateRequest.input("updated_by", sql.Int, updated_by);
      }

      if (fields.length === 0) return false;

      const query = `UPDATE SistemaWebOC.roles SET ${fields.join(
        ", "
      )} WHERE id = @id`;

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
      const result = await pool.request().input("id", sql.Int, id).query(`
          DELETE FROM SistemaWebOC.roles WHERE id = @id
        `);

      return result.rowsAffected[0] > 0;
    } catch (error) {
      console.error("Error al eliminar rol:", error);
      throw error;
    }
  }

  // Obtener roles asignados a un usuario por su userId
  async getRolesByUserId(userId) {
    try {
      const pool = await this.poolPromise;
      const result = await pool.request().input("userId", sql.Int, userId)
        .query(`
          SELECT r.id, r.nombre, usr.sistema_id
          FROM SistemaWebOC.UsuarioSistemaRol usr
          JOIN SistemaWebOC.roles r ON usr.rol_id = r.id
          WHERE usr.usuario_id = @userId
        `);
      return result.recordset.map((role) => ({
        id: Buffer.from(role.id.toString()).toString("base64"),
        nombre: role.nombre,
        sistema_id: role.sistema_id,
      }));
    } catch (error) {
      console.error("Error al obtener roles por usuario:", error);
      throw error;
    }
  }

  // Asignar un permiso a un rol en la tabla RolPermiso
  async assignPermissionToRole(roleId, permisoId) {
    try {
      const pool = await this.poolPromise;

      // Verificar existencia de la relación
      const checkRelation = await pool
        .request()
        .input("roleId", sql.Int, roleId)
        .input("permisoId", sql.Int, permisoId).query(`
          SELECT COUNT(*) AS count FROM SistemaWebOC.RolPermiso 
          WHERE rol_id = @roleId AND permiso_id = @permisoId
        `);

      if (checkRelation.recordset[0].count > 0) {
        throw new Error("La relación ya existe");
      }

      // Insertar la nueva relación
      const result = await pool
        .request()
        .input("roleId", sql.Int, roleId)
        .input("permisoId", sql.Int, permisoId).query(`
          INSERT INTO SistemaWebOC.RolPermiso (rol_id, permiso_id)
          VALUES (@roleId, @permisoId)
        `);

      return result.rowsAffected[0] > 0;
    } catch (error) {
      console.error("Error al asignar permiso al rol:", error);
      throw error;
    }
  }
}

export default RoleRepository;
