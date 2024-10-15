// src/routes/routesSistemas.js
import express from "express";
import systemService from "../application/systemService.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";

const router = express.Router();

// Ruta para obtener la lista de sistemas (vista HTML)
router.get(
  "/sistemas",
  asyncHandler(async (req, res) => {
    const sistemas = await systemService.getAllSystems();
    res.render("sistemas", { sistemas });
  })
);

// Ruta para obtener la lista de sistemas en formato JSON
router.get(
  "/sistemas-list",
  asyncHandler(async (req, res) => {
    const sistemas = await systemService.getAllSystems();
    res.json({ sistemas });
  })
);

// Ruta para obtener los detalles de un sistema específico por su ID codificado
router.get(
  "/sistemas/:encodedId",
  asyncHandler(async (req, res) => {
    const sistema = await systemService.getSystemById(req.params.encodedId);

    if (!sistema) {
      return res
        .status(404)
        .render("error", { error: "Sistema no encontrado" });
    }

    res.render("sistema/ver", { sistema });
  })
);

// Ruta para obtener la vista de edición de un sistema
router.get(
  "/sistemas-editar/:encodedId",
  asyncHandler(async (req, res) => {
    const sistema = await systemService.getSystemById(req.params.encodedId);

    if (!sistema) {
      return res
        .status(404)
        .render("error", { error: "Sistema no encontrado" });
    }

    res.render("sistema/editar", { sistema, success_msg: null, error: null });
  })
);

// Ruta para actualizar un sistema existente
router.post(
  "/sistemas-editar/:encodedId",
  asyncHandler(async (req, res) => {
    const { sistemaNombre, sistemaDescripcion } = req.body;

    const updatedSystemData = {
      nombre: sistemaNombre,
      descripcion: sistemaDescripcion,
    };

    try {
      const updateResult = await systemService.updateSystem(
        req.params.encodedId,
        updatedSystemData
      );

      if (!updateResult) {
        return res.render("sistema/editar", {
          sistema: updatedSystemData,
          error: "No hay cambios a realizar",
        });
      }

      res.render("sistema/editar", {
        sistema: updatedSystemData,
        success_msg: "Sistema actualizado exitosamente",
        error: null,
      });
    } catch (error) {
      res.render("sistema/editar", {
        sistema: updatedSystemData,
        error: error.message,
      });
    }
  })
);

// Ruta para mostrar la vista de agregar un sistema
router.get("/sistemas-agregar", (req, res) => {
  res.render("sistema/agregar", { error: null, success_msg: null });
});

// Ruta para agregar un sistema
router.post(
  "/sistemas-agregar",
  asyncHandler(async (req, res) => {
    const { sistemaNombre, sistemaDescripcion } = req.body;

    const nuevoSistema = {
      nombre: sistemaNombre,
      descripcion: sistemaDescripcion,
    };

    try {
      await systemService.createSystem(nuevoSistema);
      res.redirect("/sistemas");
    } catch (error) {
      res.render("sistema/agregar", {
        error: error.message,
        success_msg: null,
      });
    }
  })
);

// Ruta para eliminar un sistema
router.post(
  "/sistemas-eliminar/:encodedId",
  asyncHandler(async (req, res) => {
    try {
      const sistemaEliminado = await systemService.deleteSystem(
        req.params.encodedId
      );

      if (!sistemaEliminado) {
        return res.render("sistemas", { error: "Sistema no encontrado" });
      }

      res.render("sistemas", { success_msg: "Sistema eliminado exitosamente" });
    } catch (error) {
      res.render("sistemas", { error: error.message });
    }
  })
);

export default router;
