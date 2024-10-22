// src/adapters/repository/userRepository.js
import sql from "mssql";
import config from "../../config/database.js";

class UserRepository {
  constructor() {
    this.poolPromise = sql.connect(config);
  }

  // Obtener todos los usuarios con sus sistemas, roles y permisos
  async APIget(id = null) {
    try {
      const pool = await this.poolPromise;

      let query = `
        SELECT
          u.id,
          u.nombre,
          u.apellido,
          u.departamento,
          u.correo,
          s.id AS sistema_id,
          s.nombre AS sistema,
          r.id AS rol_id,
          r.nombre AS rol,
          p.id AS permiso_id,
          p.nombre AS permiso
        FROM centralusuarios.Usuarios u
        LEFT JOIN centralusuarios.UsuarioSistemaRol usr ON u.id = usr.usuario_id
        LEFT JOIN centralusuarios.Sistemas s ON s.id = usr.sistema_id
        LEFT JOIN centralusuarios.Roles r ON r.id = usr.rol_id
        LEFT JOIN centralusuarios.RolPermiso rp ON rp.rol_id = r.id
        LEFT JOIN centralusuarios.Permisos p ON p.id = rp.permiso_id
        WHERE u.eliminado = 0
      `;

      const request = pool.request();

      // Filtrar por ID si se proporciona
      if (id) {
        query += " AND u.id = @id";
        request.input("id", sql.Int, id);
      }

      const result = await request.query(query);

      const usuariosMap = {};

      result.recordset.forEach((row) => {
        const userKey = Buffer.from(row.id.toString()).toString("base64");

        if (!usuariosMap[userKey]) {
          usuariosMap[userKey] = {
            nombre: row.nombre,
            apellido: row.apellido,
            departamento: row.departamento,
            correo: row.correo,
            sistemas: [],
          };
        }

        const usuario = usuariosMap[userKey];

        // Si no hay sistema asociado, omitir esta fila
        if (row.sistema_id) {
          // Buscar el sistema en la lista del usuario
          let sistema = usuario.sistemas.find((s) => s.id === row.sistema_id);
          if (!sistema) {
            sistema = {
              id: row.sistema_id,
              sistema: row.sistema,
              roles: [],
            };
            usuario.sistemas.push(sistema);
          }

          // Si no hay rol asociado, omitir
          if (row.rol_id) {
            // Buscar el rol en la lista de roles del sistema
            let rol = sistema.roles.find((r) => r.id === row.rol_id);
            if (!rol) {
              rol = {
                id: row.rol_id,
                rol: row.rol,
                permisos: [],
              };
              sistema.roles.push(rol);
            }

            // Si hay permiso, agregarlo si no existe
            if (row.permiso_id && !rol.permisos.find((p) => p.id === row.permiso_id)) {
              rol.permisos.push({
                permiso: row.permiso,
              });
            }
          }
        }
      });

      // Transformar el mapa en una lista y eliminar los campos de id
      const usuarios = Object.values(usuariosMap).map((usuario) => ({
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        departamento: usuario.departamento,
        correo: usuario.correo,
        sistemas: usuario.sistemas.map((sistema) => ({
          sistema: sistema.sistema,
          roles: sistema.roles.map((rol) => ({
            rol: rol.rol,
            permisos: rol.permisos.map((permiso) => ({
              permiso: permiso.permiso,
            })),
          })),
        })),
      }));

      return usuarios;

    } catch (error) {
      console.error("Error al obtener datos de usuarios:", error.message);
      throw new Error("Error al obtener datos de usuarios");
    }
  }


  // Obtener usuarios paginados con filtros
  async getPaginatedUsers(limit, offset, departamento, estado, search) {
    try {
      const pool = await this.poolPromise;
      let query = `
      SELECT id, nombre, apellido, departamento, correo, activo
      FROM centralusuarios.usuarios
      WHERE eliminado = 0
    `;

      const request = pool.request();

      // Agregar filtros
      if (departamento) {
        query += " AND departamento LIKE '%' + @departamento + '%'";
        request.input("departamento", sql.NVarChar, departamento);
      }
      if (estado) {
        const activo = estado === "Activo" ? 1 : 0;
        query += " AND activo = @activo";
        request.input("activo", sql.Bit, activo);
      }
      if (search) {
        query +=
          " AND (nombre LIKE '%' + @search + '%' OR apellido LIKE '%' + @search + '%' OR correo LIKE '%' + @search + '%')";
        request.input("search", sql.NVarChar, search);
      }

      query += `
      ORDER BY id
      OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY;
    `;

      request.input("limit", sql.Int, limit).input("offset", sql.Int, offset);

      const result = await request.query(query);

      return result.recordset.map((user) => ({
        id: Buffer.from(user.id.toString()).toString("base64"),
        nombre: user.nombre,
        apellido: user.apellido,
        departamento: user.departamento,
        correo: user.correo,
        activo: Boolean(user.activo),
      }));
    } catch (error) {
      console.error("Error al obtener usuarios paginados:", error);
      throw error;
    }
  }

  // Contar el total de usuarios con filtros
  async countUsers(departamento, estado, search) {
    try {
      const pool = await this.poolPromise;
      let query = `
      SELECT COUNT(*) as total
      FROM centralusuarios.usuarios
      WHERE eliminado = 0
    `;

      const request = pool.request();

      // Agregar filtros
      if (departamento) {
        query += " AND departamento LIKE '%' + @departamento + '%'";
        request.input("departamento", sql.NVarChar, departamento);
      }
      if (estado) {
        const activo = estado === "Activo" ? 1 : 0;
        query += " AND activo = @activo";
        request.input("activo", sql.Bit, activo);
      }
      if (search) {
        query +=
          " AND (nombre LIKE '%' + @search + '%' OR apellido LIKE '%' + @search + '%' OR correo LIKE '%' + @search + '%')";
        request.input("search", sql.NVarChar, search);
      }

      const result = await request.query(query);

      return result.recordset[0].total;
    } catch (error) {
      console.error("Error al contar usuarios:", error);
      throw error;
    }
  }

  // Contar usuarios por estado
  async countUsersByEstado(estado) {
    try {
      const pool = await this.poolPromise;
      const activo = estado === "Activo" ? 1 : 0;
      const result = await pool.request().input("activo", sql.Bit, activo)
        .query(`
        SELECT COUNT(*) as total
        FROM centralusuarios.usuarios
        WHERE eliminado = 0 AND activo = @activo
      `);

      return result.recordset[0].total;
    } catch (error) {
      console.error("Error al contar usuarios por estado:", error);
      throw error;
    }
  }

  // Obtener un usuario por su ID
  async getUserById(id) {
    try {
      const pool = await this.poolPromise;
      const result = await pool.request().input("id", sql.Int, id).query(`
        SELECT
          u.id,
          u.nombre,
          u.apellido,
          u.departamento,
          u.correo,
          u.activo
        FROM centralusuarios.usuarios u
        WHERE u.eliminado = 0 AND u.id = @id
      `);

      const userRecord = result.recordset[0];
      if (!userRecord) return null;

      return {
        ...userRecord,
        id: Buffer.from(userRecord.id.toString()).toString("base64"),
        activo: Boolean(userRecord.activo),
      };
    } catch (error) {
      console.error("Error al obtener usuario por ID:", error);
      throw error;
    }
  }

  // Crear un nuevo usuario
  async createUser({
    nombre,
    apellido,
    departamento,
    correo,
    clave,
    activo,
    usuarioCreador,
  }) {
    try {
      const pool = await this.poolPromise;

      // Verificar si el correo ya existe
      const checkEmail = await pool
        .request()
        .input("correo", sql.NVarChar, correo)
        .query(
          "SELECT id FROM centralusuarios.usuarios WHERE correo = @correo AND eliminado = 0"
        );

      if (checkEmail.recordset.length > 0) {
        throw new Error("El correo ya está en uso");
      }

      // Insertar el nuevo usuario
      const result = await pool
        .request()
        .input("nombre", sql.NVarChar, nombre)
        .input("apellido", sql.NVarChar, apellido)
        .input("departamento", sql.NVarChar, departamento)
        .input("correo", sql.NVarChar, correo)
        .input("clave", sql.NVarChar, clave)
        .input("activo", sql.Bit, activo)
        .input("usuario_creador", sql.Int, usuarioCreador).query(`
          INSERT INTO centralusuarios.usuarios
          (nombre, apellido, departamento, correo, clave, activo, usuario_creador)
          OUTPUT INSERTED.id
          VALUES (@nombre, @apellido, @departamento, @correo, @clave, @activo, @usuario_creador)
        `);

      return result.recordset[0];
    } catch (error) {
      // Manejar el error específico de clave duplicada
      if (
        error.originalError &&
        error.originalError.info &&
        error.originalError.info.message &&
        error.originalError.info.message.includes(
          "Violation of UNIQUE KEY constraint"
        )
      ) {
        throw new Error("El correo ya está en uso");
      }
      console.error("Error al crear usuario:", error);
      throw error;
    }
  }

  // Actualizar un usuario existente
  async updateUser(id, data) {
    try {
      const pool = await this.poolPromise;
      const updateRequest = pool.request().input("id", sql.Int, id);

      const fields = [];
      if (data.nombre) {
        fields.push("nombre = @nombre");
        updateRequest.input("nombre", sql.NVarChar, data.nombre);
      }
      if (data.apellido) {
        fields.push("apellido = @apellido");
        updateRequest.input("apellido", sql.NVarChar, data.apellido);
      }
      if (data.departamento) {
        fields.push("departamento = @departamento");
        updateRequest.input("departamento", sql.NVarChar, data.departamento);
      }
      if (data.correo) {
        fields.push("correo = @correo");
        updateRequest.input("correo", sql.NVarChar, data.correo);
      }
      if (data.clave) {
        fields.push("clave = @clave");
        updateRequest.input("clave", sql.NVarChar, data.clave);
      }

      if (fields.length === 0) return false;

      const query = `UPDATE centralusuarios.usuarios SET ${fields.join(
        ", "
      )} WHERE id = @id`;

      const result = await updateRequest.query(query);
      return result.rowsAffected[0] > 0;
    } catch (error) {
      console.error("Error al actualizar usuario:", error);
      throw error;
    }
  }

  // Eliminar un usuario por su ID
  async deleteUser(id) {
    try {
      const pool = await this.poolPromise;
      const result = await pool
        .request()
        .input("id", sql.Int, id)
        .query(
          "UPDATE centralusuarios.usuarios SET eliminado = 1 WHERE id = @id"
        );

      return result.rowsAffected[0] > 0;
    } catch (error) {
      console.error("Error al eliminar usuario:", error);
      throw error;
    }
  }

  // Asignar un sistema y rol a un usuario en la tabla UsuarioSistemaRol
  async assignUserToSystemRole(userId, systemId, roleId) {
    try {
      const pool = await this.poolPromise;

      // Verificar existencia de la relación
      const checkRelation = await pool
        .request()
        .input("userId", sql.Int, userId)
        .input("systemId", sql.Int, systemId)
        .input("roleId", sql.Int, roleId).query(`
          SELECT COUNT(*) AS count FROM centralusuarios.UsuarioSistemaRol
          WHERE usuario_id = @userId AND sistema_id = @systemId AND rol_id = @roleId
        `);

      if (checkRelation.recordset[0].count > 0) {
        throw new Error("La asignación ya existe");
      }

      // Insertar la nueva relación
      const result = await pool
        .request()
        .input("userId", sql.Int, userId)
        .input("systemId", sql.Int, systemId)
        .input("roleId", sql.Int, roleId).query(`
          INSERT INTO centralusuarios.UsuarioSistemaRol (usuario_id, sistema_id, rol_id)
          VALUES (@userId, @systemId, @roleId)
        `);

      return result.rowsAffected[0] > 0;
    } catch (error) {
      console.error("Error al asignar sistema y rol al usuario:", error);
      throw error;
    }
  }

  // Obtener sistemas, roles y permisos asignados a un usuario
  async getUserSystemsRolesPermissions(userId) {
    try {
      const pool = await this.poolPromise;
      const result = await pool.request().input("userId", sql.Int, userId)
        .query(`
          SELECT
            s.id AS sistema_id,
            s.nombre AS sistema_nombre,
            r.id AS rol_id,
            r.nombre AS rol_nombre,
            p.id AS permiso_id,
            p.nombre AS permiso_nombre
          FROM
            centralusuarios.UsuarioSistemaRol usr
          JOIN
            centralusuarios.sistemas s ON usr.sistema_id = s.id
          JOIN
            centralusuarios.roles r ON usr.rol_id = r.id
          LEFT JOIN
            centralusuarios.RolPermiso rp ON r.id = rp.rol_id
          LEFT JOIN
            centralusuarios.permisos p ON rp.permiso_id = p.id
          WHERE
            usr.usuario_id = @userId
          ORDER BY
            s.nombre, r.nombre, p.nombre
        `);

      return result.recordset.map((row) => ({
        sistema_id: Buffer.from(row.sistema_id.toString()).toString("base64"),
        sistema_nombre: row.sistema_nombre,
        rol_id: Buffer.from(row.rol_id.toString()).toString("base64"),
        rol_nombre: row.rol_nombre,
        permiso_id: row.permiso_id
          ? Buffer.from(row.permiso_id.toString()).toString("base64")
          : null,
        permiso_nombre: row.permiso_nombre || null,
      }));
    } catch (error) {
      console.error(
        "Error al obtener sistemas, roles y permisos del usuario:",
        error
      );
      throw error;
    }
  }
  // Obtener sistemas, roles y permisos asignados a un usuario paginados con filtros
  async getUserSystemsRolesPermissionsPaginated(
    userId,
    limit,
    offset,
    sistemaFilter,
    rolFilter,
    searchValue
  ) {
    try {
      const pool = await this.poolPromise;
      let query = `
      SELECT
        s.id AS sistema_id,
        s.nombre AS sistema_nombre,
        r.id AS rol_id,
        r.nombre AS rol_nombre,
        p.id AS permiso_id,
        p.nombre AS permiso_nombre
      FROM
        centralusuarios.UsuarioSistemaRol usr
      JOIN
        centralusuarios.sistemas s ON usr.sistema_id = s.id
      JOIN
        centralusuarios.roles r ON usr.rol_id = r.id
      LEFT JOIN
        centralusuarios.RolPermiso rp ON r.id = rp.rol_id
      LEFT JOIN
        centralusuarios.permisos p ON rp.permiso_id = p.id
      WHERE
        usr.usuario_id = @userId
    `;

      // Agregar filtros
      if (sistemaFilter) {
        query += " AND s.nombre LIKE '%' + @sistemaFilter + '%'";
      }
      if (rolFilter) {
        query += " AND r.nombre LIKE '%' + @rolFilter + '%'";
      }
      if (searchValue) {
        query +=
          " AND (s.nombre LIKE '%' + @searchValue + '%' OR r.nombre LIKE '%' + @searchValue + '%' OR p.nombre LIKE '%' + @searchValue + '%')";
      }

      query += `
      ORDER BY
        s.nombre, r.nombre, p.nombre
      OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
    `;

      const request = pool
        .request()
        .input("userId", sql.Int, userId)
        .input("limit", sql.Int, limit)
        .input("offset", sql.Int, offset);

      if (sistemaFilter) {
        request.input("sistemaFilter", sql.NVarChar, sistemaFilter);
      }
      if (rolFilter) {
        request.input("rolFilter", sql.NVarChar, rolFilter);
      }
      if (searchValue) {
        request.input("searchValue", sql.NVarChar, searchValue);
      }

      const result = await request.query(query);

      return result.recordset.map((row) => ({
        sistema_id: Buffer.from(row.sistema_id.toString()).toString("base64"),
        sistema_nombre: row.sistema_nombre,
        rol_id: Buffer.from(row.rol_id.toString()).toString("base64"),
        rol_nombre: row.rol_nombre,
        permiso_id: row.permiso_id
          ? Buffer.from(row.permiso_id.toString()).toString("base64")
          : null,
        permiso_nombre: row.permiso_nombre || null,
      }));
    } catch (error) {
      console.error("Error al obtener asignaciones paginadas:", error);
      throw error;
    }
  }

  // Contar el total de asignaciones de un usuario con filtros
  async countUserAssignments(userId, sistemaFilter, rolFilter, searchValue) {
    try {
      const pool = await this.poolPromise;
      let query = `
      SELECT COUNT(*) AS total
      FROM
        centralusuarios.UsuarioSistemaRol usr
      JOIN
        centralusuarios.sistemas s ON usr.sistema_id = s.id
      JOIN
        centralusuarios.roles r ON usr.rol_id = r.id
      LEFT JOIN
        centralusuarios.RolPermiso rp ON r.id = rp.rol_id
      LEFT JOIN
        centralusuarios.permisos p ON rp.permiso_id = p.id
      WHERE
        usr.usuario_id = @userId
    `;

      // Agregar filtros
      if (sistemaFilter) {
        query += " AND s.nombre LIKE '%' + @sistemaFilter + '%'";
      }
      if (rolFilter) {
        query += " AND r.nombre LIKE '%' + @rolFilter + '%'";
      }
      if (searchValue) {
        query +=
          " AND (s.nombre LIKE '%' + @searchValue + '%' OR r.nombre LIKE '%' + @searchValue + '%' OR p.nombre LIKE '%' + @searchValue + '%')";
      }

      const request = pool.request().input("userId", sql.Int, userId);

      if (sistemaFilter) {
        request.input("sistemaFilter", sql.NVarChar, sistemaFilter);
      }
      if (rolFilter) {
        request.input("rolFilter", sql.NVarChar, rolFilter);
      }
      if (searchValue) {
        request.input("searchValue", sql.NVarChar, searchValue);
      }

      const result = await request.query(query);
      return result.recordset[0].total;
    } catch (error) {
      console.error("Error al contar asignaciones:", error);
      throw error;
    }
  }

  // Eliminar una asignación de sistema y rol al usuario
  async removeUserSystemRoleAssignment(userId, systemId, roleId) {
    try {
      const pool = await this.poolPromise;
      const result = await pool
        .request()
        .input("userId", sql.Int, userId)
        .input("systemId", sql.Int, systemId)
        .input("roleId", sql.Int, roleId).query(`
        DELETE FROM centralusuarios.UsuarioSistemaRol
        WHERE usuario_id = @userId AND sistema_id = @systemId AND rol_id = @roleId
      `);
      return result.rowsAffected[0] > 0;
    } catch (error) {
      console.error("Error al eliminar asignación:", error);
      throw error;
    }
  }
}

export default UserRepository;
