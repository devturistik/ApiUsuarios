// src/routes/routesUsuarios.js
import express from "express";
import { body, param, query, validationResult } from "express-validator";
import userService from "../application/userService.js";
import systemService from "../application/systemService.js";
import roleService from "../application/roleService.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import { decodeId } from "../utils/idEncoder.js";

const router = express.Router();

// Ruta para obtener la lista de usuarios (vista HTML)
router.get(
  "/usuarios",
  asyncHandler(async (req, res) => {
    res.render("usuarios");
  })
);

// Ruta para listar los usuarios en formato JSON para DataTables
router.get(
  "/usuarios-list",
  [
    query("limit").optional().isInt({ min: 1 }).toInt(),
    query("offset").optional().isInt({ min: 0 }).toInt(),
    query("draw").optional().isInt().toInt(),
    query("departamento").optional().trim(),
    query("estado").optional().trim(),
    query("search").optional().trim(),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array() });
    }

    const limit = req.query.limit || 100;
    const offset = req.query.offset || 0;
    const draw = req.query.draw;
    const departamento = req.query.departamento || "";
    const estado = req.query.estado === "all" ? "" : req.query.estado || "";
    const search = req.query.search || "";

    try {
      const usuarios = await userService.getPaginatedUsers(
        limit,
        offset,
        departamento,
        estado,
        search
      );
      const totalUsuarios = await userService.countUsers();

      // Obtener totales de usuarios activos e inactivos
      const totalUsuariosActivos = await userService.countUsersByEstado(
        "Activo"
      );
      const totalUsuariosInactivos = await userService.countUsersByEstado(
        "Inactivo"
      );

      const totalFiltrados = await userService.countUsers("", estado, search);

      res.json({
        draw: draw,
        recordsTotal: totalUsuarios,
        recordsFiltered: totalFiltrados,
        data: usuarios,
        totalActivos: totalUsuariosActivos,
        totalInactivos: totalUsuariosInactivos,
      });
    } catch (error) {
      console.error("Error al obtener usuarios:", error);
      res.status(500).json({ error: "Error al obtener usuarios" });
    }
  })
);

// Ruta para obtener los detalles de un usuario específico por su ID codificado
router.get(
  "/usuarios/:encodedId",
  param("encodedId").notEmpty().isBase64(),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).render("error", { error: "ID inválido" });
    }

    const usuario = await userService.getUserById(req.params.encodedId);

    if (!usuario) {
      return res
        .status(404)
        .render("error", { error: "Usuario no encontrado" });
    }

    res.render("usuario/ver", { usuario });
  })
);

// Ruta para obtener la vista de edición de usuario
router.get(
  "/usuarios-editar/:encodedId",
  param("encodedId").notEmpty().isBase64(),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).render("error", { error: "ID inválido" });
    }

    const usuario = await userService.getUserById(req.params.encodedId);

    if (!usuario) {
      return res
        .status(404)
        .render("error", { error: "Usuario no encontrado" });
    }

    res.render("usuario/editar", { usuario, success_msg: null, error: null });
  })
);

// Ruta para actualizar un usuario existente
router.post(
  "/usuarios-editar/:encodedId",
  [
    param("encodedId").notEmpty().isBase64(),
    body("usuarioNombre").notEmpty().withMessage("El nombre es obligatorio."),
    body("usuarioApellido")
      .notEmpty()
      .withMessage("El apellido es obligatorio."),
    body("usuarioDepartamento")
      .notEmpty()
      .withMessage("El departamento es obligatorio."),
    body("usuarioCorreo")
      .notEmpty()
      .isEmail()
      .withMessage("Debe ser un correo válido."),
    body("usuarioClave")
      .optional({ checkFalsy: true })
      .isLength({ min: 6 })
      .withMessage("La clave debe tener al menos 6 caracteres."),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    const { encodedId } = req.params;

    if (!errors.isEmpty()) {
      const usuario = await userService.getUserById(encodedId);
      return res.render("usuario/editar", {
        usuario,
        error: errors.array()[0].msg,
      });
    }

    const {
      usuarioNombre,
      usuarioApellido,
      usuarioDepartamento,
      usuarioCorreo,
      usuarioClave,
    } = req.body;

    const updatedUserData = {
      nombre: usuarioNombre,
      apellido: usuarioApellido,
      departamento: usuarioDepartamento,
      correo: usuarioCorreo,
    };

    if (usuarioClave && usuarioClave.trim() !== "") {
      updatedUserData.clave = usuarioClave;
    }

    try {
      const updateResult = await userService.updateUser(
        encodedId,
        updatedUserData
      );

      if (!updateResult) {
        return res.render("usuario/editar", {
          usuario: updatedUserData,
          error: "No hay cambios a realizar",
        });
      }

      // Si el usuario autenticado está editando su propio perfil, actualizamos la sesión
      if (decodeId(res.locals.user.id) === decodeId(encodedId)) {
        req.session.user = {
          id: encodedId,
          nombre: updatedUserData.nombre,
          apellido: updatedUserData.apellido,
          departamento: updatedUserData.departamento,
          correo: updatedUserData.correo,
        };
      }

      res.render("usuario/editar", {
        usuario: updatedUserData,
        success_msg: "Usuario actualizado exitosamente",
        error: null,
      });
    } catch (error) {
      res.render("usuario/editar", {
        usuario: updatedUserData,
        error: "Error al actualizar el usuario",
      });
    }
  })
);

// Ruta para mostrar la vista de agregar un usuario
router.get("/usuarios-agregar", (req, res) => {
  res.render("usuario/agregar", { error: null, success_msg: null });
});

// Ruta para agregar un usuario
router.post(
  "/usuarios-agregar",
  [
    body("usuarioNombre").notEmpty().withMessage("El nombre es obligatorio."),
    body("usuarioApellido")
      .notEmpty()
      .withMessage("El apellido es obligatorio."),
    body("usuarioDepartamento")
      .notEmpty()
      .withMessage("El departamento es obligatorio."),
    body("usuarioCorreo")
      .notEmpty()
      .isEmail()
      .withMessage("Debe ser un correo válido."),
    body("usuarioClave")
      .notEmpty()
      .isLength({ min: 6 })
      .withMessage("La clave debe tener al menos 6 caracteres."),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.render("usuario/agregar", {
        error: errors.array()[0].msg,
        success_msg: null,
      });
    }

    const {
      usuarioNombre,
      usuarioApellido,
      usuarioDepartamento,
      usuarioCorreo,
      usuarioClave,
    } = req.body;

    const nuevoUsuario = {
      nombre: usuarioNombre,
      apellido: usuarioApellido,
      departamento: usuarioDepartamento,
      correo: usuarioCorreo,
      clave: usuarioClave,
      activo: 0,
      usuarioCreador: decodeId(res.locals.user.id),
    };

    try {
      await userService.createUser(nuevoUsuario);
      res.redirect("/usuarios");
    } catch (error) {
      // Captura el error de correo duplicado y renderiza la vista con el mensaje
      if (error.message === "El correo ya está en uso") {
        return res.render("usuario/agregar", {
          error: "El correo ya está en uso. Por favor, elige otro.",
          success_msg: null,
        });
      }
      // Otros errores
      res.render("usuario/agregar", {
        error: "Error al crear el usuario",
        success_msg: null,
      });
    }
  })
);

// Ruta para eliminar un usuario
router.post(
  "/usuarios-eliminar/:encodedId",
  param("encodedId").notEmpty().isBase64(),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render("usuarios", { error: "ID inválido" });
    }

    try {
      const usuarioEliminado = await userService.deleteUser(
        req.params.encodedId
      );

      if (!usuarioEliminado) {
        return res.render("usuarios", { error: "Usuario no encontrado" });
      }

      res.redirect("/usuarios");
    } catch (error) {
      res.render("usuarios", { error: "Error al eliminar el usuario" });
    }
  })
);

// Ruta para mostrar el formulario de asignación de sistemas y roles a un usuario
router.get(
  "/usuarios-asignar/:encodedId",
  param("encodedId").notEmpty().isBase64(),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).render("error", { error: "ID inválido" });
    }

    try {
      const usuarioId = req.params.encodedId;
      const usuario = await userService.getUserById(usuarioId);

      if (!usuario) {
        return res
          .status(404)
          .render("error", { error: "Usuario no encontrado" });
      }

      const sistemas = await systemService.getAllSystems();
      const roles = await roleService.getAllRoles();

      // Obtener sistemas, roles y permisos asignados al usuario
      const userAssignments = await userService.getUserSystemsRolesPermissions(
        usuarioId
      );

      res.render("usuario/asignar", {
        usuario,
        sistemas,
        roles,
        userAssignments,
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

// Ruta para asignar sistema y rol a un usuario
router.post(
  "/usuarios-asignar/:encodedId",
  [
    param("encodedId").notEmpty().isBase64(),
    body("sistemaEncodedId")
      .notEmpty()
      .isBase64()
      .withMessage("Sistema inválido."),
    body("rolEncodedId").notEmpty().isBase64().withMessage("Rol inválido."),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).render("error", { error: errors.array()[0].msg });
    }

    try {
      const usuarioEncodedId = req.params.encodedId;
      const { sistemaEncodedId, rolEncodedId } = req.body;

      await userService.assignUserToSystemRole(
        usuarioEncodedId,
        sistemaEncodedId,
        rolEncodedId
      );

      const usuario = await userService.getUserById(usuarioEncodedId);
      const sistemas = await systemService.getAllSystems();
      const roles = await roleService.getAllRoles();

      res.render("usuario/asignar", {
        usuario,
        sistemas,
        roles,
        success_msg: "Sistema y rol asignados correctamente al usuario.",
        error: null,
      });
    } catch (error) {
      console.error("Error al asignar sistema y rol al usuario:", error);
      res.status(500).render("error", {
        error: "Error al asignar sistema y rol al usuario",
      });
    }
  })
);

// Ruta para obtener los sistemas, roles y permisos asignados al usuario en formato JSON para DataTables
router.get(
  "/usuarios-asignar-list/:encodedId",
  param("encodedId").notEmpty().isBase64(),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: "ID inválido" });
    }

    const limit = parseInt(req.query.limit) || 100;
    const offset = parseInt(req.query.offset) || 0;
    const draw = req.query.draw;
    const sistemaFilter = req.query.sistema || "";
    const rolFilter = req.query.rol || "";
    const searchValue = req.query.search || "";

    try {
      const usuarioId = req.params.encodedId;
      const data = await userService.getUserSystemsRolesPermissionsPaginated(
        usuarioId,
        limit,
        offset,
        sistemaFilter,
        rolFilter,
        searchValue
      );
      const totalRecords = await userService.countUserAssignments(
        usuarioId,
        sistemaFilter,
        rolFilter,
        searchValue
      );

      res.json({
        draw: draw,
        recordsTotal: totalRecords,
        recordsFiltered: totalRecords,
        data: data,
      });
    } catch (error) {
      console.error("Error al obtener asignaciones:", error);
      res.status(500).json({ error: "Error al obtener asignaciones" });
    }
  })
);

// Ruta para eliminar una asignación de sistema y rol al usuario
router.post(
  "/usuarios-asignar-eliminar",
  [
    body("usuarioId").notEmpty().isBase64(),
    body("sistemaId").notEmpty().isBase64(),
    body("rolId").notEmpty().isBase64(),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: "Datos inválidos" });
    }

    try {
      const { usuarioId, sistemaId, rolId } = req.body;
      await userService.removeUserSystemRoleAssignment(
        usuarioId,
        sistemaId,
        rolId
      );
      res.status(200).json({ message: "Asignación eliminada" });
    } catch (error) {
      console.error("Error al eliminar asignación:", error);
      res.status(500).json({ error: "Error al eliminar asignación" });
    }
  })
);

export default router;
