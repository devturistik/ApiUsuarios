

import sql from 'mssql';
import bcrypt from 'bcrypt';
import User from '../../domain/user.js';

const config = {
  user: 'DBAfinanzas',
  password: 'BHM3mfc2edt!qpk0ung',
  server: 'turistikfi.database.windows.net',
  database: 'finanzas',
  options: {
    encrypt: true,
    trustServerCertificate: true
  }
};

export default class UserRepository {
  constructor() {
    this.poolPromise = sql.connect(config);
  }

  async getUserById(id) {
    try {
      const pool = await this.poolPromise;
      const result = await pool.request()
        .input('id', sql.Int, id)
        .query('SELECT * FROM SistemaWebOC.usuarios WHERE id = @id');
      const user = result.recordset[0];
      if (!user) throw new Error('User not found');
      return new User(user.id, user.clave, user.nombre, user.depto, user.correo, user.activo,user.apellido);
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  }

  async createUser(usuarioClave, usuarioNombre, usuarioDepartamento, usuarioCorreo, usuarioApellido,usuarioCreador) {
    console.log("Usuario Clave: ",usuarioClave)
    try {
      const existingUser = await this.getUserByEmail(usuarioCorreo);
      if (existingUser) {
        throw new Error('El email ya está registrado.');
      }

      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(usuarioClave, saltRounds);
      const pool = await this.poolPromise;
      const result = await pool.request()
        .input('clave', sql.NVarChar, hashedPassword)
        .input('nombre', sql.NVarChar, usuarioNombre)
        .input('depto', sql.NVarChar, usuarioDepartamento)
        .input('correo', sql.NVarChar, usuarioCorreo)
        .input('apellido', sql.NVarChar, usuarioApellido)
        .input('usuarioCreador', sql.Int, usuarioCreador)
        
        .query('INSERT INTO SistemaWebOC.usuarios (clave, nombre, depto, correo, apellido, activo,usuario_creador) OUTPUT INSERTED.Id VALUES (@clave, @nombre, @depto, @correo, @apellido, 0,@usuarioCreador)');
      return result.recordset[0].Id;
    } catch (error) {
      console.error('Error inserting user:', error);
      throw error; // Relanzar el error
    }
  }

  async getUserByEmail(email) {
    try {
      const pool = await this.poolPromise;
      const result = await pool.request()
        .input('correo', sql.NVarChar, email)
        .input('activo', sql.Int, 1)
        .query('SELECT * FROM SistemaWebOC.Usuarios WHERE correo = @correo and activo = @activo');
      return result.recordset[0];
    } catch (error) {
      console.error('Error fetching user by email:', error);
      throw error;
    }
  }

  async loginUser(correo, clave) {
    try {
      const user = await this.getUserByEmail(correo);
      if (!user) return { error: "ERROR_LOGIN" };
        
      const isPasswordValid = await bcrypt.compare(clave, user.clave);
      if (!isPasswordValid) return { error: "ERROR_LOGIN" };
      console.log("usuario cuando viene de la bd",user);
      return new User(user.id,"", user.nombre, user.depto, user.correo,user.activo,user.apellido);
    } catch (error) {
      console.error('Error during login:', error);
      throw error;
    }
  }

  async updateUser(id, updates) {
    try {
      const pool = await this.poolPromise;
      const keys = Object.keys(updates);
  
      // Manejar la actualización de la contraseña
      if (updates.clave) {
        const saltRounds = 10;
        updates.clave = await bcrypt.hash(updates.clave, saltRounds);
      }
  
      const query = `UPDATE SistemaWebOC.usuarios SET ${keys.map((key, index) => `${key} = @param${index}`).join(', ')} WHERE id = @id`;
      
      const request = pool.request().input('id', sql.Int, id);
      keys.forEach((key, index) => {
        request.input(`param${index}`, sql.NVarChar, updates[key]);
      });
  
      const result = await request.query(query);
      if (result.rowsAffected[0] === 0) throw new Error('User not found');
  
      return result.rowsAffected[0];
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }
  

  async deleteUser(id) {
    try {
      const pool = await this.poolPromise;
      const result = await pool.request()
        .input('id', sql.Int, id)
        .query('UPDATE SistemaWebOC.usuarios SET eliminado = 1 WHERE id = @id');
      if (result.rowsAffected[0] === 0) throw new Error('User not found');
      return result.rowsAffected[0];
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  async getAllUsers() {
   
    try {
      const pool = await this.poolPromise;
      const result = await pool.request()
        .query('SELECT * FROM SistemaWebOC.usuarios WHERE eliminado = 0'); // Solo usuarios no eliminados
  
      return result.recordset.map(user => new User(user.id, user.clave, user.nombre, user.depto, user.correo,user.activo,user.apellido));
    } catch (error) {
      console.error('Error fetching all users:', error);
      throw error;
    }
  }
}
