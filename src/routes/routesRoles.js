// src/routes/routesRoles.js
import express from "express";
import { body, param, query, validationResult } from "express-validator";
import roleService from "../application/roleService.js";
import permissionService from "../application/permissionService.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import { decodeId } from "../utils/idEncoder.js";

const router = express.Router();

// Ruta para obtener la lista de roles (vista HTML)
router.get(
  "/roles",
  asyncHandler(async (req, res) => {
    res.render("roles");
  })
);

// Ruta para listar los roles en formato JSON para DataTables
router.get(
  "/roles-list",
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

    const roles = await roleService.getPaginatedRoles(limit, offset);
    const totalRoles = await roleService.countRoles();

    // Enviamos los datos en el formato que DataTables espera
    res.json({
      draw: draw,
      recordsTotal: totalRoles,
      recordsFiltered: totalRoles,
      data: roles,
    });
  })
);

// Ruta para obtener los detalles de un rol específico por su ID codificado
router.get(
  "/roles/:encodedId",
  param("encodedId").notEmpty().isBase64(),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).render("error", { error: "ID inválido" });
    }

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
  param("encodedId").notEmpty().isBase64(),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).render("error", { error: "ID inválido" });
    }

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
  [
    param("encodedId").notEmpty().isBase64(),
    body("rolNombre")
      .notEmpty()
      .withMessage("El nombre del rol es obligatorio."),
    body("nivelJerarquia")
      .notEmpty()
      .isInt({ min: 1 })
      .withMessage(
        "El nivel de jerarquía es obligatorio y debe ser un número entero positivo."
      ),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    const { encodedId } = req.params;

    if (!errors.isEmpty()) {
      const rol = await roleService.getRoleById(encodedId);
      return res.render("rol/editar", {
        rol,
        error: errors.array()[0].msg,
      });
    }

    const { rolNombre, nivelJerarquia } = req.body;

    const updatedRoleData = {
      nombre: rolNombre,
      nivel_jerarquia: parseInt(nivelJerarquia, 10),
      updated_by: decodeId(res.locals.user.id),
    };

    try {
      const updateResult = await roleService.updateRole(
        encodedId,
        updatedRoleData
      );

      if (!updateResult) {
        return res.render("rol/editar", {
          rol: { ...updatedRoleData, id: encodedId },
          error: "No hay cambios a realizar",
        });
      }

      res.render("rol/editar", {
        rol: { ...updatedRoleData, id: encodedId },
        success_msg: "Rol actualizado exitosamente",
        error: null,
      });
    } catch (error) {
      res.render("rol/editar", {
        rol: { ...updatedRoleData, id: encodedId },
        error: "Error al actualizar el rol",
      });
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
  [
    body("rolNombre")
      .notEmpty()
      .withMessage("El nombre del rol es obligatorio."),
    body("nivelJerarquia")
      .notEmpty()
      .isInt({ min: 1 })
      .withMessage(
        "El nivel de jerarquía es obligatorio y debe ser un número entero positivo."
      ),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.render("rol/agregar", {
        error: errors.array()[0].msg,
        success_msg: null,
      });
    }

    const { rolNombre, nivelJerarquia } = req.body;

    const nuevoRol = {
      nombre: rolNombre,
      nivel_jerarquia: parseInt(nivelJerarquia, 10),
      created_by: decodeId(res.locals.user.id),
    };

    try {
      await roleService.createRole(nuevoRol);
      res.redirect("/roles");
    } catch (error) {
      res.render("rol/agregar", {
        error: "Error al crear el rol",
        success_msg: null,
      });
    }
  })
);

// Ruta para eliminar un rol
router.post(
  "/roles-eliminar/:encodedId",
  param("encodedId").notEmpty().isBase64(),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render("roles", { error: "ID inválido" });
    }

    try {
      const rolEliminado = await roleService.deleteRole(req.params.encodedId);

      if (!rolEliminado) {
        return res.render("roles", { error: "Rol no encontrado" });
      }

      res.redirect("/roles");
    } catch (error) {
      res.render("roles", { error: "Error al eliminar el rol" });
    }
  })
);

// Mostrar formulario para asignar permiso a un rol
router.get(
  "/roles-asignar/:encodedId",
  param("encodedId").notEmpty().isBase64(),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).render("error", { error: "ID inválido" });
    }

    try {
      const encodedId = req.params.encodedId;
      const rol = await roleService.getRoleById(encodedId);

      if (!rol) {
        return res.status(404).render("error", { error: "Rol no encontrado" });
      }

      const permisos = await permissionService.getAllPermissions();

      res.render("rol/asignar", {
        rol,
        permisos,
        success_msg: null,
        error: null,
      });
    } catch (error) {
      console.error("Error al obtener datos:", error);
      res
        .status(500)
        .render("error", { error: "Error al obtener datos del servidor" });
    }
  })
);

// Asignar permiso al rol
router.post(
  "/roles-asignar/:encodedId",
  [
    param("encodedId").notEmpty().isBase64(),
    body("permisoEncodedId")
      .notEmpty()
      .isBase64()
      .withMessage("Permiso inválido."),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).render("error", { error: errors.array()[0].msg });
    }

    try {
      const { permisoEncodedId } = req.body;
      const roleEncodedId = req.params.encodedId;

      await roleService.assignPermissionToRole(roleEncodedId, permisoEncodedId);

      const rol = await roleService.getRoleById(roleEncodedId);
      const permisos = await permissionService.getAllPermissions();

      res.render("rol/asignar", {
        rol,
        permisos,
        success_msg: "Permiso asignado correctamente al rol.",
        error: null,
      });
    } catch (error) {
      console.error("Error al asignar permiso al rol:", error);
      res
        .status(500)
        .render("error", { error: "Error al asignar permiso al rol" });
    }
  })
);

export default router;
