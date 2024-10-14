// src/routes/api/endpointsUsuarios.js
import express from "express";
import userService from "../../application/userService.js";

const router = express.Router();

// GET /api/v1/usuarios - Listar todos los usuarios
router.get("/", async (req, res) => {
  try {
    const usuarios = await userService.getAllUsers();
    res.json({ usuarios });
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    res.status(500).json({ message: "Error al obtener usuarios" });
  }
});

// GET /api/v1/usuarios/:id - Obtener usuario por ID
router.get("/:id", async (req, res) => {
  try {
    // Decodificar el ID de Base64 a entero
    const decodedId = Buffer.from(req.params.id, "base64").toString("ascii");

    const usuario = await userService.getUserById(decodedId);
    if (!usuario) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    res.json(usuario);
  } catch (error) {
    console.error("Error al obtener usuario por ID:", error);
    res.status(500).json({ message: "Error al obtener usuario" });
  }
});

// POST /api/v1/usuarios - Crear un nuevo usuario
router.post("/", async (req, res) => {
  try {
    const nuevoUsuario = await userService.createUser(req.body);
    res.status(201).json(nuevoUsuario);
  } catch (error) {
    console.error("Error al crear usuario:", error);
    res.status(500).json({ message: "Error al crear usuario" });
  }
});

// PUT /api/v1/usuarios/:id - Actualizar un usuario existente
router.put("/:id", async (req, res) => {
  try {
    const usuarioActualizado = await userService.updateUser(
      req.params.id,
      req.body
    );
    if (!usuarioActualizado) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    res.json(usuarioActualizado);
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    res.status(500).json({ message: "Error al actualizar usuario" });
  }
});

// DELETE /api/v1/usuarios/:id - Eliminar un usuario
router.delete("/:id", async (req, res) => {
  try {
    const usuarioEliminado = await userService.deleteUser(req.params.id);
    if (!usuarioEliminado) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    res.status(204).send();
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    res.status(500).json({ message: "Error al eliminar usuario" });
  }
});

export default router;
