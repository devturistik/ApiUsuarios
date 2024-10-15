// src/routes/routes.js
import express from "express";
import routesUsuarios from "./routesUsuarios.js";
import routesSistemas from "./routesSistemas.js";
import routesRoles from "./routesRoles.js";
import routesPermisos from "./routesPermisos.js";

const router = express.Router();

// Renderizado de /dashboard
router.get("/dashboard", (req, res) => {
  res.render("dashboard");
});

// Rutas protegidas
router.use(routesUsuarios);
router.use(routesSistemas);
router.use(routesRoles);
router.use(routesPermisos);

export default router;
