// src/routes/api/endpointsSistemas.js
import express from "express";
import systemService from "../../application/systemService.js";

const router = express.Router();

// GET /api/v1/sistemas - Listar todos los sistemas
router.get("/sistemas", async (req, res) => {
  try {
    const sistemas = await systemService.getAllSystems();
    res.json({ sistemas });
  } catch (error) {
    console.error("Error al obtener sistemas:", error);
    res.status(500).json({ message: "Error al obtener sistemas" });
  }
});

// GET /api/v1/sistemas/:id - Obtener sistema por ID
router.get("/sistemas/:id", async (req, res) => {
  try {
    // Decodificar el ID de Base64 a entero
    const decodedId = Buffer.from(req.params.id, "base64").toString("ascii");

    const sistema = await userService.getUserById(decodedId);
    if (!sistema) {
      return res.status(404).json({ message: "sistema no encontrado" });
    }
    res.json(sistema);
  } catch (error) {
    console.error("Error al obtener sistema por ID:", error);
    res.status(500).json({ message: "Error al obtener sistema" });
  }
});

// POST /api/v1/sistemas - Crear un nuevo sistema
router.post("/sistemas", async (req, res) => {
  try {
    const nuevoSistema = await userService.createUser(req.body);
    res.status(201).json(nuevoSistema);
  } catch (error) {
    console.error("Error al crear sistema:", error);
    res.status(500).json({ message: "Error al crear sistema" });
  }
});

// PUT /api/v1/sistemas/:id - Actualizar un sistema existente
router.put("/sistemas/:id", async (req, res) => {
  try {
    const sistemaActualizado = await userService.updateUser(
      req.params.id,
      req.body
    );
    if (!sistemaActualizado) {
      return res.status(404).json({ message: "Sistema no encontrado" });
    }
    res.json(sistemaActualizado);
  } catch (error) {
    console.error("Error al actualizar sistema:", error);
    res.status(500).json({ message: "Error al actualizar sistema" });
  }
});

// DELETE /api/v1/sistemas/:id - Eliminar un sistema
router.delete("/sistemas/:id", async (req, res) => {
  try {
    const sistemaEliminado = await userService.deleteUser(req.params.id);
    if (!sistemaEliminado) {
      return res.status(404).json({ message: "Sistema no encontrado" });
    }
    res.status(204).send();
  } catch (error) {
    console.error("Error al eliminar sistema:", error);
    res.status(500).json({ message: "Error al eliminar sistema" });
  }
});

export default router;
