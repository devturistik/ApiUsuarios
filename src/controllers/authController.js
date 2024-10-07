import authService from '../application/authService.js';

// Mapa de mensajes de error y sus códigos hash
const errorCodes = {
  'correo o contraseña invalido': '6f6e4c0e2c4d9b54e0dff08b7b5f07a0f953e32b7e6795e7b6e55e87531a5f3d',
  'User not found': 'b9d9a0b530fe478c9e9b9e7d65a87c75da6a65fc9bb3d228b3ae1f84ac972a68'
};

// Generar un código hash para un mensaje de error
function generateErrorCode(message) {
  return errorCodes[message] || 'unknown_error_code';
}

export const login = async (req, res) => {
  console.log("req controller",req.body);
  try {
    const { email, password } = req.body;

    // Validar los campos necesarios
    if (!email || !password) {
      return res.render('login', {
        error: 'Por favor, ingresa tu correo y contraseña.',
        success_msg: null,
      });
    }

    // Intentar iniciar sesión
    const user = await authService.login(email, password);

    if (user.error === "ERROR_LOGIN") {
      // Error en el login
      return res.render('login', {
        error: 'Correo o contraseña inválido.',
        success_msg: null,
      });
    }
    console.log("datos del usuario cuando hace login",user);
    // Establecer una sesión para el usuario
    req.session.userId = user.id;
    req.session.userName = user.nombre; // Guarda el nombre
    req.session.userApellido = user.apellido; // Guarda el apellido
    req.session.userDepto = user.depto; // Guarda el depto
    req.session.userEmail = user.correo; // Guarda el correo
    req.session.userActivo = user.activo; // Guarda el estado activo

    // Redirigir al usuario a la página protegida
    return res.redirect('/');

  } catch (error) {
    console.error('Error durante el login:', error);
    
    // Manejar errores específicos y otros errores
    return res.render('login', {
      error: 'Error en el servidor. Por favor, intenta de nuevo más tarde.',
      success_msg: null,
    });
  }
};


// export const login = async (req, res) => {
//     try {
//       const { email, password} = req.body;
        
//       // Validar los campos necesarios
//       if (!email || !password) {
//         return res.status(400).json({ error: 'All fields are required' });
//       }
  
//       const userId = await authService.login(email, password)
//       console.log('Created user with ID controllers:', userId);
//       req.session.userId = userId; // Establece una sesión
//       return res.redirect('/'); // Redirige a la página protegida
//       //res.status(201).json({ "userCreate": 1 });
//     } catch (error) {
//       console.error('Error al hacer login:', error);
  
//       if (error.code === 'ERROR_LOGIN') {
//         return res.status(400).json({ error: error.message });
//       }
  
//       res.status(500).json({ error: 'Error login' });
//     }
    
//   };
