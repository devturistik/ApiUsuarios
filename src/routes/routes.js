// src/routes/routes.js
import express from "express";
import routesUsuarios from "./routesUsuarios.js";
import routesSistemas from "./routesSistemas.js";
import endpointsUsuarios from "./api/endpointsUsuarios.js";
// import endpointsSistemas from "./api/endpointsSistemas.js";

const router = express.Router();

// Redirección de la raíz a /dashboard
router.get("/", (req, res) => {
  res.redirect("/dashboard");
});

// Renderizado de /dashboard
router.get("/dashboard", (req, res) => {
  res.render("dashboard");
});

// Rutas protegidas
router.use("/usuarios", routesUsuarios);
router.use("/sistemas", routesSistemas);

// Rutas API protegidas
router.use("/api/v1/usuarios", endpointsUsuarios);
// router.use("/api/v1/sistemas", endpointsSistemas);

export default router;
