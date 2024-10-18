// src/controllers/authController.js
import authService from "../application/authService.js";
import { body, validationResult } from "express-validator";
import { asyncHandler } from "../middlewares/asyncHandler.js";

export const login = [
  body("email").isEmail().withMessage("Introduce un correo válido"),
  body("password").notEmpty().withMessage("La contraseña es requerida"),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render("login", {
        error: errors.array()[0].msg,
      });
    }

    const { email, password } = req.body;
    const user = await authService.login(email, password);

    if (!user) {
      return res.render("login", {
        title: "Login",
        error: "Correo o contraseña incorrectos",
      });
    }

    // Codificación en Base64 para mayor seguridad
    const encodedUserId = Buffer.from(user.id.toString()).toString("base64");

    // Guardado de la sesión
    req.session.user = {
      id: encodedUserId,
      nombre: user.nombre,
      apellido: user.apellido,
      departamento: user.departamento,
      correo: user.correo,
    };

    res.redirect("/dashboard");
  }),
];

export const logout = async (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).send("Error al cerrar sesión");
    res.redirect("/");
  });
};
