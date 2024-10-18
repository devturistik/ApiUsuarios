// app.js
import express from "express";
import path from "path";
import session from "express-session";
import flash from "express-flash";
import routes from "./routes/routes.js";
import routesLogin from "./routes/routesLogin.js"; // Ruta de login
import requireAuth from "./middlewares/authMiddleware.js";
import endpointsUsuarios from "./routes/api/endpointsUsuarios.js";

const app = express();

// Configuración de EJS como motor de plantillas
app.set("view engine", "ejs");
app.set("views", path.join(process.cwd(), "src", "views"));

// Configuración de la sesión
const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret && process.env.NODE_ENV === "production") {
  throw new Error("SESSION_SECRET debe estar definido en producción");
}
app.use(
  session({
    secret: sessionSecret || "Turistik", // Cambia 'Turistik' por un secreto fuerte
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure:
        process.env.NODE_ENV === "production" ||
        process.env.SECURE_COOKIES === "true",
      maxAge: 1000 * 60 * 60 * 24,
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
  res.locals.user = req.session.user || null; // Guarda el usuario con la sesion iniciada
  next();
});
app.use(routes);

// Iniciar el servidor
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Servidor en el puerto ${PORT}`);
});

export default app;
