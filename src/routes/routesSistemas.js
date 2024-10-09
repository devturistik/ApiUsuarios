import express from "express";
import {
  getAllSystems,
  createSystem,
  updateSystem,
  deleteSystem,
  viewSystem,
} from "../controllers/systemController.js";
import requireAuth from "../middleware/auth.js"; // Importa el middleware de autenticación

const router = express.Router();

// Ruta para obtener todos los sistemas (para el DataTable)
router.get("/", async (req, res) => {
  try {
    const systems = await getAllSystems();
    res.status(200).json(systems);
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener los sistemas",
      error: error.message,
    });
  }
});

// src/routes/routesSistemas.js
router.get("/sistemas", requireAuth, (req, res) => {
  const user = req.session;
  req.session.error = null;
  res.render("sistemas", { user, error: null, success_msg: null }); // Renderiza solo si hay sesión
});

// Rutas para agregar un sistema
router.get("/sistema-agregar", requireAuth, (req, res) => {
  console.log(req.session.user)
  const error = req.session.error || null;
  req.session.error = null;

  res.render("sistema-agregar", {
    user: req.session.user,
    error,
    success_msg: null,
  });
});
router.post("/sistema-agregar", requireAuth, createSystem);

// Ruta para ver un sistema
router.get("/sistema-ver/:id", requireAuth, viewSystem);

// Rutas para editar un sistema
router.get("/sistema-editar/:id", requireAuth, viewSystem);
router.post("/sistema-editar/:id", requireAuth, updateSystem);

// Ruta para eliminar un sistema por id
router.delete("/sistema-borrar/:id", requireAuth, deleteSystem);

export default router;
