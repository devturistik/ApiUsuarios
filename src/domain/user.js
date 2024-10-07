// src/domain/user.js

export default class User {
    constructor(id,hashedPassword, nombre, depto, correo, activo,apellido,usuarioCreador ) {
        this.id = id;               // ID del usuario (autoincremental)
        this.clave = hashedPassword; // Contraseña en formato hash
        this.nombre = nombre;       // Nombre del usuario
        this.depto = depto;         // Departamento del usuario
        this.correo = correo;       // Correo electrónico del usuario
        this.activo = activo;        
        this.apellido = apellido;
        this.usuarioCreador = usuarioCreador;
        
    }
    
    // Método para verificar la contraseña (no es parte del modelo, pero podría ser útil)
    async verifyPassword(password, bcrypt) {
        return bcrypt.compare(password, this.hashedPassword);
    }
}
