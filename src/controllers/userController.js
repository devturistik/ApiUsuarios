import userService from '../application/userService.js';

export const getUserById = async (req, res) => {
  try {
    const decodedId = atob(req.params.uuid); // Decodifica el UUID
    const userId = parseInt(decodedId, 10); // Convierte a número entero

    // Llama al servicio con el ID decodificado
    const user = await userService.getUserById(userId);

    if (!user) {
      return res.status(404).render('404'); // Renderiza una página 404 si no se encuentra
    }

    res.render('usuario-ver', { user, error: null }); // Renderiza la vista del usuario
  } catch (error) {
    console.error('Error en la obtención del usuario:', error);
    res.status(500).send('Error en el servidor');
  }
};
export const getUserByIdEditar = async (req, res) => {
  try {
    const decodedId = atob(req.params.uuid); // Decodifica el UUID
    const userId = parseInt(decodedId, 10); // Convierte a número entero

    // Llama al servicio con el ID decodificado
    const user = await userService.getUserById(userId);

    if (!user) {
      return res.status(404).render('404'); // Renderiza una página 404 si no se encuentra
    }

    res.render('usuario-editar', { user, error: null , success_msg: null}); // Renderiza la vista del usuario
  } catch (error) {
    console.error('Error en la obtención del usuario:', error);
    res.status(500).send('Error en el servidor');
  }
};
export const createUser = async (req, res) => {
  try {
    const { usuarioClave, usuarioNombre, usuarioApellido, usuarioDepartamento, usuarioCorreo } = req.body;
   
    const usuarioCreador = req.session.userId;
    // Validar los campos necesarios
    if (!usuarioClave || !usuarioNombre || !usuarioApellido || !usuarioCorreo || !usuarioDepartamento) {
      return res.render('usuario-agregar', { error: 'Faltan campos obligatorios.', success_msg: null });
    }
   

    // Intentar crear el usuario
    await userService.createUser(usuarioClave, usuarioNombre, usuarioDepartamento, usuarioCorreo, usuarioApellido,usuarioCreador);
    
    // Si el usuario se crea con éxito
    return res.render('usuario-agregar', { error: null, success_msg: 'Usuario creado exitosamente.' }); // Renderiza con mensaje de éxito
  } catch (error) {
    console.error('Error creating user controllers:', error);

    if (error.message === 'El email ya está registrado.') {
      return res.render('usuario-agregar', { error: error.message, success_msg: null }); // Renderizar la vista con el mensaje de error
    }

    return res.render('usuario-agregar', { error: 'Error al crear el usuario', success_msg: null }); // Mensaje genérico
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await userService.getAllUsers();
    return users;
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Error al obtener los usuarios' });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const userId = parseInt(req.params.id, 10);
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const deletedUser = await userService.deleteUser(userId);
    if (!deletedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(204).send(); // No content
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Error al eliminar el usuario' });
  }
};

export const updateUserById = async (req, res) => {
  console.log("controllers", req.params.uuid, req.body);
  const decodedId = atob(req.params.uuid); // Decodifica el UUID
 
  try {
    const userId = parseInt(decodedId, 10); // Convierte a número entero
    const { usuarioNombre, usuarioApellido, usuarioDepto, usuarioCorreo, usuarioClave } = req.body;

    const userUpdateData = {
      nombre: usuarioNombre,
      apellido: usuarioApellido,
      depto: usuarioDepto,
      correo: usuarioCorreo,
    };

    // Solo incluir la clave si se proporciona
    if (usuarioClave) {
      userUpdateData.clave = usuarioClave;
    }

    const updatedUser = await userService.updateUserById(userId, userUpdateData);
    console.log("update ", typeof updatedUser);

    // Verifica si `updatedUser` es un número y si es mayor a 0
    if (typeof updatedUser !== 'number' || updatedUser <= 0) {
      // Si no se pudo actualizar el usuario, muestra solo el mensaje de error
      return res.render('usuario-editar', { error: 'Error al actualizar el usuario.', user: req.body, success_msg: null });
    }

    // Si se actualizó correctamente, muestra solo el mensaje de éxito
    res.render('usuario-editar', { success_msg: 'Usuario actualizado exitosamente.', user: { id: userId, ...userUpdateData }, error: null });
  } catch (error) {
    console.error('Error al actualizar el usuario:', error);
    res.render('usuario-editar', { error: 'Error en el servidor.', user: req.body, success_msg: null });
  }
};




export const suspendUserById = async (req, res) => {
  try {
    const decodedId = atob(req.params.uuid); // Decodifica el UUID
    const userId = parseInt(decodedId, 10); // Convierte a número entero

    const suspendedUser = await userService.suspendUserById(userId);
    if (!suspendedUser) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({ message: 'Usuario suspendido exitosamente' });
  } catch (error) {
    console.error('Error suspending user:', error);
    res.status(500).json({ error: 'Error al suspender el usuario' });
  }
};
