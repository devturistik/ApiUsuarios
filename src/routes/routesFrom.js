import express from 'express';
import requireAuth from '../middleware/auth.js'; // Importa el middleware de autenticación
import { login } from '../controllers/authController.js';
import { createUser, getUserById, updateUserById, suspendUserById ,getUserByIdEditar} from '../controllers/userController.js';

const router = express.Router();

// Ruta para la página de inicio
router.get('/', requireAuth, (req, res) => {
  res.render('dashboard', { user: req.session.userId }); // Renderiza solo si hay sesión
});

// Ruta para ver todos los usuarios
router.get('/usuarios', requireAuth, (req, res) => {
  const user = req.session; 
  console.log("usuario en la ruta de usuarios :",user);
  req.session.error = null; 
  res.render('usuarios', { user, error:null, success_msg: null }); // Renderiza solo si hay sesión
});

// Ruta para agregar un usuario
router.get('/usuario-agregar', requireAuth, (req, res) => {
  const error = req.session.error || null; 
  const user = req.session.userId; 
  
  req.session.error = null; 
  res.render('usuario-agregar', { user, error, success_msg: null }); 
});

router.post('/usuario-agregar', requireAuth, createUser); // Llama al controlador para crear el usuario

// Ruta para ver un usuario por UUID
router.get('/usuario-ver/:uuid', requireAuth, getUserById); // Llama al controlador para obtener un usuario

// Ruta para editar un usuario por UUID
router.get('/usuario-editar/:uuid', requireAuth, getUserByIdEditar); // Usamos getUserById para obtener el usuario para editar
router.post('/usuario-editar/:uuid', requireAuth, updateUserById); // Lógica para actualizar el usuario

// Ruta para suspender un usuario por UUID
router.post('/usuario-suspender/:uuid', requireAuth, async (req, res) => {
  try {
    await suspendUserById(req.params.uuid); // Suspende el usuario por UUID
    res.redirect('/usuarios'); // Redirige a la lista de usuarios
  } catch (error) {
    console.error(error);
    res.status(500).send('Error en el servidor');
  }
});

// Ruta para la página de inicio de sesión
router.get('/login', (req, res) => {
  // Verificar si existe una sesión activa
  if (req.session.user) { // Asegúrate de que 'user' sea la propiedad que defines para la sesión
    return res.redirect('/'); // Redirige a la ruta principal
  }

  const errorCode = req.query.error || null;
  console.log("sesion login ", req.session);

  // Mapear código de error a mensaje
  const errorMessages = {
    '6f6e4c0e2c4d9b54e0dff08b7b5f07a0f953e32b7e6795e7b6e55e87531a5f3d': 'Correo o contraseña inválidos',
    'b9d9a0b530fe478c9e9b9e7d65a87c75da6a65fc9bb3d228b3ae1f84ac972a68': 'Usuario no encontrado'
    // Agrega más códigos según sea necesario
  };

  const getErrorMessage = (code) => errorMessages[code] || 'Ocurrió un error desconocido';
  const errorMessage = errorCode ? getErrorMessage(errorCode) : null;

  res.render('login', { error: errorMessage });
});


router.post('/login', login); // Llama al controlador para iniciar sesión

// Ruta para cerrar sesión
router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.redirect('/'); // Si hay un error, redirige al usuario
    }
    res.clearCookie('connect.sid'); // Limpia la cookie de la sesión
    res.redirect('/login'); // Redirige al login
  });
});


//sistemas
// Ruta para ver todos los usuarios
router.get('/sistemas', requireAuth, (req, res) => {
  const user = req.session; 

  req.session.error = null; 
  res.render('sistemas', { user, error:null, success_msg: null }); // Renderiza solo si hay sesión
});

export default router;
