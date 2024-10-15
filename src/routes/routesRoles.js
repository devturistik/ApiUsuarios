// src/routes/routesRoles.js
import express from "express";
import roleService from "../application/roleService.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";

const router = express.Router();

// Ruta para obtener la lista de roles (vista HTML)
router.get(
  "/roles",
  asyncHandler(async (req, res) => {
    const roles = await roleService.getAllRoles();
    res.render("roles", { roles });
  })
);

// Ruta para obtener la lista de roles en formato JSON
router.get(
  "/roles-list",
  asyncHandler(async (req, res) => {
    const roles = await roleService.getAllRoles();
    res.json({ roles });
  })
);

// Ruta para obtener los detalles de un rol específico por su ID codificado
router.get(
  "/roles/:encodedId",
  asyncHandler(async (req, res) => {
    const rol = await roleService.getRoleById(req.params.encodedId);

    if (!rol) {
      return res.status(404).render("error", { error: "Rol no encontrado" });
    }

    res.render("rol/ver", { rol });
  })
);

// Ruta para obtener la vista de edición de un rol
router.get(
  "/roles-editar/:encodedId",
  asyncHandler(async (req, res) => {
    const rol = await roleService.getRoleById(req.params.encodedId);

    if (!rol) {
      return res.status(404).render("error", { error: "Rol no encontrado" });
    }

    res.render("rol/editar", { rol, success_msg: null, error: null });
  })
);

// Ruta para actualizar un rol existente
router.post(
  "/roles-editar/:encodedId",
  asyncHandler(async (req, res) => {
    const { rolNombre, nivelJerarquia } = req.body;

    const updatedRoleData = {
      nombre: rolNombre,
      nivel_jerarquia: nivelJerarquia,
    };

    try {
      const updateResult = await roleService.updateRole(
        req.params.encodedId,
        updatedRoleData
      );

      if (!updateResult) {
        return res.render("rol/editar", {
          rol: updatedRoleData,
          error: "No hay cambios a realizar",
        });
      }

      res.render("rol/editar", {
        rol: updatedRoleData,
        success_msg: "Rol actualizado exitosamente",
        error: null,
      });
    } catch (error) {
      res.render("rol/editar", { rol: updatedRoleData, error: error.message });
    }
  })
);

// Ruta para mostrar la vista de agregar un rol
router.get("/roles-agregar", (req, res) => {
  res.render("rol/agregar", { error: null, success_msg: null });
});

// Ruta para agregar un rol
router.post(
  "/roles-agregar",
  asyncHandler(async (req, res) => {
    const { rolNombre, nivelJerarquia } = req.body;

    const nuevoRol = {
      nombre: rolNombre,
      nivel_jerarquia: nivelJerarquia,
    };

    try {
      await roleService.createRole(nuevoRol);
      res.redirect("/roles");
    } catch (error) {
      res.render("rol/agregar", { error: error.message, success_msg: null });
    }
  })
);

// Ruta para eliminar un rol
router.post(
  "/roles-eliminar/:encodedId",
  asyncHandler(async (req, res) => {
    try {
      const rolEliminado = await roleService.deleteRole(req.params.encodedId);

      if (!rolEliminado) {
        return res.render("roles", { error: "Rol no encontrado" });
      }

      res.render("roles", { success_msg: "Rol eliminado exitosamente" });
    } catch (error) {
      res.render("roles", { error: error.message });
    }
  })
);

export default router;
