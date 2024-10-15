// src/adapters/repository/userRepository.js
import sql from "mssql";
import config from "../../config/database.js";

class UserRepository {
  constructor() {
    this.poolPromise = sql.connect(config);
  }

  // Obtener todos los usuarios
  async getAllUsers() {
    try {
      const pool = await this.poolPromise;
      const result = await pool
        .request()
        .query(
          "SELECT id, nombre, apellido, depto, correo, activo FROM SistemaWebOC.usuarios WHERE eliminado = 0"
        );

      return result.recordset.map((user) => ({
        id: Buffer.from(user.id.toString()).toString("base64"),
        nombre: user.nombre,
        apellido: user.apellido,
        departamento: user.depto,
        correo: user.correo,
        activo: user.activo === 1, // Convertir a booleano
      }));
    } catch (error) {
      console.error("Error al obtener usuarios:", error);
      throw error;
    }
  }

  // Obtener un usuario por su ID
  async getUserById(decodedId) {
    try {
      const pool = await this.poolPromise;
      const result = await pool
        .request()
        .input("id", sql.Int, decodedId)
        .query("SELECT * FROM SistemaWebOC.usuarios WHERE id = @id");

      const user = result.recordset[0];
      if (!user) return null;

      return {
        id: Buffer.from(user.id.toString()).toString("base64"),
        nombre: user.nombre,
        apellido: user.apellido,
        departamento: user.depto,
        correo: user.correo,
        activo: Boolean(user.activo),
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

      // Verifica si el correo ya existe
      const checkEmail = await pool
        .request()
        .input("correo", sql.NVarChar, correo)
        .query("SELECT id FROM SistemaWebOC.usuarios WHERE correo = @correo");

      if (checkEmail.recordset.length > 0) {
        const error = new Error("El correo ya está en uso");
        error.code = "DUPLICATE_EMAIL";
        throw error;
      }

      // Si el correo es único, inserta el nuevo usuario
      const result = await pool
        .request()
        .input("nombre", sql.NVarChar, nombre)
        .input("apellido", sql.NVarChar, apellido)
        .input("depto", sql.NVarChar, departamento)
        .input("correo", sql.NVarChar, correo)
        .input("clave", sql.NVarChar, clave)
        .input("activo", sql.Bit, activo)
        .input("usuario_creador", sql.Int, usuarioCreador).query(`
          INSERT INTO SistemaWebOC.usuarios (nombre, apellido, depto, correo, clave, activo, usuario_creador)
          OUTPUT INSERTED.id
          VALUES (@nombre, @apellido, @depto, @correo, @clave, @activo, @usuario_creador)
        `);

      return result.recordset[0];
    } catch (error) {
      console.error("Error al crear usuario:", error);
      throw error;
    }
  }

  // Actualizar un usuario existente
  async updateUser(id, { nombre, apellido, departamento, correo, clave }) {
    try {
      const currentUser = await this.getUserById(id);
      if (!currentUser) throw new Error("Usuario no encontrado");

      let query = "UPDATE SistemaWebOC.usuarios SET ";
      const queryFields = [];
      const params = { id };

      if (nombre && nombre !== currentUser.nombre) {
        queryFields.push("nombre = @nombre");
        params.nombre = nombre;
      }
      if (apellido && apellido !== currentUser.apellido) {
        queryFields.push("apellido = @apellido");
        params.apellido = apellido;
      }
      if (departamento && departamento !== currentUser.departamento) {
        queryFields.push("depto = @departamento");
        params.departamento = departamento;
      }
      if (correo && correo !== currentUser.correo) {
        queryFields.push("correo = @correo");
        params.correo = correo;
      }
      if (clave) {
        queryFields.push("clave = @clave");
        params.clave = clave;
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
        .query("UPDATE SistemaWebOC.usuarios SET eliminado = 1 WHERE id = @id");

      // Devuelve `true` si la actualización afectó una fila, o `false` si no se encontró el usuario
      return result.rowsAffected[0] > 0;
    } catch (error) {
      console.error("Error al marcar el usuario como eliminado:", error);
      throw error;
    }
  }
}

export default UserRepository;
