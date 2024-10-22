// src/routes/api/endpointsUsuarios
import express from "express";
import userService from "../../application/userService.js";
import loginToken from "../../controllers/authTokenController.js";
import { loginApi } from "../../controllers/authLoginController.js";
import requireAuthApi from "../../middlewares/authApiMiddleware.js";

const router = express.Router();

// GET /api/v1/usuarios - Listar todos los usuarios
router.get("/usuarios", requireAuthApi, async (req, res) => {
  try {
    const usuarios = await userService.APIget();
    res.status(200).json({ usuarios });
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    res.status(500).json({ message: "Error al obtener usuarios" });
  }
});

// GET /api/v1/usuarios/:encodedId - Obtener usuario por ID
router.get("/usuarios/:encodedId", requireAuthApi, async (req, res) => {
  try {
    const usuario = await userService.APIget(req.params.encodedId);

    if (!usuario) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.status(200).json(usuario[0]);
  } catch (error) {
    console.error("Error al obtener usuario por ID:", error);
    res.status(400).json({ message: "Error al obtener usuario" });
  }
});

// Autenticación y autorización de usuario
router.post("/auth/token", loginToken);
router.post("/auth/login", requireAuthApi, loginApi);

export default router;
