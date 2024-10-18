// src/routes/routesSistemas.js
import express from "express";
import { body, param, query, validationResult } from "express-validator";
import systemService from "../application/systemService.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import { decodeId } from "../utils/idEncoder.js";

const router = express.Router();

// Ruta para obtener la lista de sistemas (vista HTML)
router.get(
  "/sistemas",
  asyncHandler(async (req, res) => {
    res.render("sistemas");
  })
);

// Ruta para listar los sistemas en formato JSON para DataTables
router.get(
  "/sistemas-list",
  [
    query("limit").optional().isInt({ min: 1 }).toInt(),
    query("offset").optional().isInt({ min: 0 }).toInt(),
    query("draw").optional().isInt().toInt(),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array() });
    }

    const limit = req.query.limit || 100;
    const offset = req.query.offset || 0;
    const draw = req.query.draw;

    const sistemas = await systemService.getPaginatedSystems(limit, offset);
    const totalSistemas = await systemService.countSystems();

    // Enviamos los datos en el formato que DataTables espera
    res.json({
      draw: draw,
      recordsTotal: totalSistemas,
      recordsFiltered: totalSistemas,
      data: sistemas,
    });
  })
);

// Ruta para obtener los detalles de un sistema específico por su ID codificado
router.get(
  "/sistemas/:encodedId",
  param("encodedId").notEmpty().isBase64(),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).render("error", { error: "ID inválido" });
    }

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
  param("encodedId").notEmpty().isBase64(),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).render("error", { error: "ID inválido" });
    }

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
  [
    param("encodedId").notEmpty().isBase64(),
    body("sistemaNombre")
      .notEmpty()
      .withMessage("El nombre del sistema es obligatorio."),
    body("sistemaDescripcion")
      .notEmpty()
      .withMessage("La descripción es obligatoria."),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    const { encodedId } = req.params;

    if (!errors.isEmpty()) {
      const sistema = await systemService.getSystemById(encodedId);
      return res.render("sistema/editar", {
        sistema,
        error: errors.array()[0].msg,
      });
    }

    const { sistemaNombre, sistemaDescripcion } = req.body;

    const updatedSystemData = {
      nombre: sistemaNombre,
      descripcion: sistemaDescripcion,
      // 'vigente' no se actualiza desde el formulario
    };

    try {
      const updateResult = await systemService.updateSystem(
        encodedId,
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
        error: "Error al actualizar el sistema",
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
  [
    body("sistemaNombre")
      .notEmpty()
      .withMessage("El nombre del sistema es obligatorio."),
    body("sistemaDescripcion")
      .notEmpty()
      .withMessage("La descripción es obligatoria."),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.render("sistema/agregar", {
        error: errors.array()[0].msg,
        success_msg: null,
      });
    }

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
        error: "Error al crear el sistema",
        success_msg: null,
      });
    }
  })
);

// Ruta para eliminar un sistema (actualizar 'vigente' a 0)
router.post(
  "/sistemas-eliminar/:encodedId",
  param("encodedId").notEmpty().isBase64(),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render("sistemas", { error: "ID inválido" });
    }

    try {
      const sistemaEliminado = await systemService.deleteSystem(
        req.params.encodedId
      );

      if (!sistemaEliminado) {
        return res.render("sistemas", { error: "Sistema no encontrado" });
      }

      res.redirect("/sistemas");
    } catch (error) {
      res.render("sistemas", { error: "Error al eliminar el sistema" });
    }
  })
);

export default router;
