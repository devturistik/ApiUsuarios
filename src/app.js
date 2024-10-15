import express from "express";
import path from "path";
import session from "express-session";
import flash from "express-flash";
import routes from "./routes/routes.js";
import routesLogin from "./routes/routesLogin.js"; // Ruta de login
import requireAuth from "./middleware/authMiddleware.js";
import endpointsUsuarios from "./routes/api/endpointsUsuarios.js";
import dotenv from 'dotenv';

dotenv.config(); // Cargar variables de entorno desde .env

const app = express();

// Configuración de EJS como motor de plantillas
app.set("view engine", "ejs");
app.set("views", path.join(process.cwd(), "src", "views"));

// Configuración de la sesión
app.use(
  session({
    secret: process.env.SESSION_SECRET || "Turistik", // Cambia 'Turistik' por un secreto fuerte
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 24, // Duración de la sesión: 1 día
    },
  })
);

// Inicializa flash para notificaciones rápidas y temporales
app.use(flash());

// Middleware para parsear JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos desde la carpeta "public"
app.use(express.static(path.join(process.cwd(), "src", "public")));

// Ruta API
app.use("/api/v1", endpointsUsuarios);

// Rutas de autenticación
app.use(routesLogin);

// Aplicar requireAuth a todas las rutas después de /login
app.use(requireAuth);
app.use((req, res, next) => {
  res.locals.currentUrl = req.originalUrl; // Guarda la URL actual
  res.locals.user = req.session.user || null; // Guarda el usuario con la sesión iniciada
  next();
});

// Rutas adicionales
app.use(routes);

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Algo salió mal!');
});

// Iniciar el servidor
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Servidor en el puerto ${PORT}`);
});

export default app;
