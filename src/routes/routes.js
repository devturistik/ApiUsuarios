import express from 'express';
import { getUserById, createUser, getAllUsers, deleteUser } from '../controllers/userController.js';

const router = express.Router();

// Ruta para obtener todos los usuarios (para el DataTable)
router.get('/', async (req, res) => {
    console.log("llegue");
  try {
    const users = await getAllUsers();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los usuarios', error: error.message });
  }
});

// Ruta para obtener un usuario por ID
router.get('/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await getUserById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el usuario', error: error.message });
  }
});

// Ruta para crear un nuevo usuario
router.post('/', async (req, res) => {
  try {
    const newUser = req.body;
    const createdUser = await createUser(newUser);
    
    res.status(201).json(createdUser);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear el usuario', error: error.message });
  }
});

// Ruta para eliminar un usuario por ID
router.delete('/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const deletedUser = await deleteUser(userId);
    
    if (!deletedUser) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.status(204).send(); // No content
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar el usuario', error: error.message });
  }
});

export default router;
