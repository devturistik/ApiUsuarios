// src/routes/routesPermisos.js
import express from "express";
import permissionService from "../application/permissionService.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";

const router = express.Router();

// Ruta para obtener la lista de permisos (vista HTML)
router.get(
  "/permisos",
  asyncHandler(async (req, res) => {
    const permisos = await permissionService.getAllPermissions();
    res.render("permisos", { permisos });
  })
);

// Ruta para obtener la lista de permisos en formato JSON
router.get(
  "/permisos-list",
  asyncHandler(async (req, res) => {
    const permisos = await permissionService.getAllPermissions();
    res.json({ permisos });
  })
);

// Ruta para obtener los detalles de un permiso específico por su ID codificado
router.get(
  "/permisos/:encodedId",
  asyncHandler(async (req, res) => {
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
  asyncHandler(async (req, res) => {
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
  asyncHandler(async (req, res) => {
    const { permisoNombre } = req.body;

    const updatedPermissionData = {
      nombre: permisoNombre,
    };

    try {
      const updateResult = await permissionService.updatePermission(
        req.params.encodedId,
        updatedPermissionData
      );

      if (!updateResult) {
        return res.render("permiso/editar", {
          permiso: updatedPermissionData,
          error: "No hay cambios a realizar",
        });
      }

      res.render("permiso/editar", {
        permiso: updatedPermissionData,
        success_msg: "Permiso actualizado exitosamente",
        error: null,
      });
    } catch (error) {
      res.render("permiso/editar", {
        permiso: updatedPermissionData,
        error: error.message,
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
  asyncHandler(async (req, res) => {
    const { permisoNombre } = req.body;

    const nuevoPermiso = {
      nombre: permisoNombre,
    };

    try {
      await permissionService.createPermission(nuevoPermiso);
      res.redirect("/permisos");
    } catch (error) {
      res.render("permiso/agregar", {
        error: error.message,
        success_msg: null,
      });
    }
  })
);

// Ruta para eliminar un permiso
router.post(
  "/permisos-eliminar/:encodedId",
  asyncHandler(async (req, res) => {
    try {
      const permisoEliminado = await permissionService.deletePermission(
        req.params.encodedId
      );

      if (!permisoEliminado) {
        return res.render("permisos", { error: "Permiso no encontrado" });
      }

      res.render("permisos", { success_msg: "Permiso eliminado exitosamente" });
    } catch (error) {
      res.render("permisos", { error: error.message });
    }
  })
);

export default router;
