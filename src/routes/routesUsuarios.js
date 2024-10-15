// src/routes/routesUsuarios.js
import express from "express";
import userService from "../application/userService.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";

const router = express.Router();

// Ruta para obtener la lista de usuarios (vista HTML)
router.get(
  "/usuarios",
  asyncHandler(async (req, res) => {
    const usuarios = await userService.getAllUsers();
    res.render("usuarios", { usuarios });
  })
);

// Ruta para obtener la lista de usuarios en formato JSON
router.get(
  "/usuarios-list",
  asyncHandler(async (req, res) => {
    const usuarios = await userService.getAllUsers();
    res.json({ usuarios });
  })
);

// Ruta para obtener los detalles de un usuario específico por su ID codificado
router.get(
  "/usuarios/:encodedId",
  asyncHandler(async (req, res) => {
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
  asyncHandler(async (req, res) => {
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
  asyncHandler(async (req, res) => {
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
      clave: usuarioClave || null,
    };

    try {
      const updateResult = await userService.updateUser(
        req.params.encodedId,
        updatedUserData
      );

      if (!updateResult) {
        return res.render("usuario/editar", {
          usuario: updatedUserData,
          error: "No hay cambios a realizar",
        });
      }

      res.render("usuario/editar", {
        usuario: updatedUserData,
        success_msg: "Usuario actualizado exitosamente",
        error: null,
      });
    } catch (error) {
      res.render("usuario/editar", {
        usuario: updatedUserData,
        error: error.message,
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
  asyncHandler(async (req, res) => {
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
      usuarioCreador: atob(res.locals.user.id),
    };

    try {
      await userService.createUser(nuevoUsuario);
      res.redirect("/usuarios");
    } catch (error) {
      res.render("usuario/agregar", {
        error: error.message,
        success_msg: null,
      });
    }
  })
);

// Ruta para eliminar un usuario
router.post(
  "/usuarios-eliminar/:encodedId",
  asyncHandler(async (req, res) => {
    try {
      const usuarioEliminado = await userService.deleteUser(
        req.params.encodedId
      );

      if (!usuarioEliminado) {
        return res.render("usuarios", { error: "Usuario no encontrado" });
      }

      res.render("usuarios", { success_msg: "Usuario eliminado exitosamente" });
    } catch (error) {
      res.render("usuarios", { error: error.message });
    }
  })
);

export default router;
