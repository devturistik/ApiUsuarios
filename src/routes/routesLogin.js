// src/routes/routesLogin.js
import express from "express";
import { login, logout } from "../controllers/authController.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";

const router = express.Router();

// Redirige al dashboard si ya está autenticado
router.get("/", (req, res) => {
  if (req.session.user) {
    return res.redirect("/dashboard");
  }
  res.redirect("login");
});

router.get("/login", (req, res) => {
  if (req.session.user) {
    return res.redirect("/dashboard");
  }
  res.render("login", { title: "Login", error: null });
});

// Manejo de inicio de sesión
router.post("/login", login);

// Cierre de sesión
router.get("/logout", asyncHandler(logout));

export default router;
