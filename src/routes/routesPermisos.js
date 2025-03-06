// src/routes/routesPermisos.js
import express from "express";
import { body, param, query, validationResult } from "express-validator";
import permissionService from "../application/permissionService.js";
import roleService from "../application/roleService.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import { decodeId } from "../utils/idEncoder.js";

const router = express.Router();

// Ruta para obtener la lista de permisos (vista HTML)
router.get(
  "/permisos",
  asyncHandler(async (req, res) => {
    res.render("permisos");
  })
);

// Ruta para enlistar los permisos en formato JSON para DataTables
router.get(
  "/permisos-list",
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

    const limit = req.query.limit || 100; // Límite de permisos por página
    const offset = req.query.offset || 0; // Desplazamiento (inicio)
    const draw = req.query.draw; // Parámetro de DataTables

    const permisos = await permissionService.getPaginatedPermissions(
      limit,
      offset
    );
    const totalPermisos = await permissionService.countPermissions();

    // Enviamos los datos en el formato que DataTables espera
    res.json({
      draw: draw,
      recordsTotal: totalPermisos,
      recordsFiltered: totalPermisos,
      data: permisos,
    });
  })
);

// Ruta para obtener los detalles de un permiso específico por su ID codificado
router.get(
  "/permisos/:encodedId",
  param("encodedId").notEmpty().isBase64(),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).render("error", { error: "ID inválido" });
    }

    const permiso = await permissionService.getPermissionById(
      req.params.encodedId
    );

    if (!permiso) {
      return res
        .status(404)
        .render("error", { error: "Permiso no encontrado" });
    }

    res.render("permiso/ver", { permiso });
  })
);

// Ruta para obtener la vista de edición de un permiso
router.get(
  "/permisos-editar/:encodedId",
  param("encodedId").notEmpty().isBase64(),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).render("error", { error: "ID inválido" });
    }

    const permiso = await permissionService.getPermissionById(
      req.params.encodedId
    );

    if (!permiso) {
      return res
        .status(404)
        .render("error", { error: "Permiso no encontrado" });
    }

    res.render("permiso/editar", { permiso, success_msg: null, error: null });
  })
);

// Ruta para actualizar un permiso existente
router.post(
  "/permisos-editar/:encodedId",
  [
    param("encodedId").notEmpty().isBase64(),
    body("permisoNombre")
      .notEmpty()
      .withMessage("El nombre del permiso es obligatorio."),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    const { encodedId } = req.params;

    if (!errors.isEmpty()) {
      const permiso = await permissionService.getPermissionById(encodedId);
      return res.render("permiso/editar", {
        permiso,
        error: errors.array()[0].msg,
      });
    }

    const { permisoNombre } = req.body;

    const updatedPermissionData = {
      nombre: permisoNombre,
      updated_by: decodeId(res.locals.user.id),
    };

    try {
      const updateResult = await permissionService.updatePermission(
        encodedId,
        updatedPermissionData
      );

      if (!updateResult) {
        return res.render("permiso/editar", {
          permiso: { ...updatedPermissionData, id: encodedId },
          error: "No hay cambios a realizar",
        });
      }

      res.render("permiso/editar", {
        permiso: { ...updatedPermissionData, id: encodedId },
        success_msg: "Permiso actualizado exitosamente",
        error: null,
      });
    } catch (error) {
      res.render("permiso/editar", {
        permiso: { ...updatedPermissionData, id: encodedId },
        error: "Error al actualizar el permiso",
      });
    }
  })
);

// Ruta para mostrar la vista de agregar un permiso
router.get("/permisos-agregar", (req, res) => {
  res.render("permiso/agregar", { error: null, success_msg: null });
});

// Ruta para agregar un permiso
router.post(
  "/permisos-agregar",
  [
    body("permisoNombre")
      .notEmpty()
      .withMessage("El nombre del permiso es obligatorio."),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.render("permiso/agregar", {
        error: errors.array()[0].msg,
        success_msg: null,
      });
    }

    const { permisoNombre } = req.body;

    const nuevoPermiso = {
      nombre: permisoNombre,
      created_by: decodeId(res.locals.user.id),
    };

    try {
      await permissionService.createPermission(nuevoPermiso);
      res.redirect("/permisos");
    } catch (error) {
      res.render("permiso/agregar", {
        error: "Error al crear el permiso",
        success_msg: null,
      });
    }
  })
);

// Ruta para eliminar un permiso
router.post(
  "/permisos-eliminar/:encodedId",
  param("encodedId").notEmpty().isBase64(),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render("permisos", { error: "ID inválido" });
    }

    try {
      const permisoEliminado = await permissionService.deletePermission(
        req.params.encodedId
      );

      if (!permisoEliminado) {
        return res.render("permisos", { error: "Permiso no encontrado" });
      }

      res.redirect("/permisos");
    } catch (error) {
      res.render("permisos", { error: "Error al eliminar el permiso" });
    }
  })
);

export default router;
