import express from 'express';
import path from 'path';
import session from 'express-session';
import flash from 'express-flash'; // Importa express-flash
import routesUser from './routes/routes.js';
import routesSistemas from './routes/routesSistemas.js';
import routesFrom from './routes/routesFrom.js';

const app = express();

// Configuración de EJS como motor de plantillas
app.set('view engine', 'ejs');
app.set('views', path.join(process.cwd(), 'src', 'views'));

// Configuración de la sesión
app.use(
  session({
    secret: 'Turistik', // Cambia 'Turistik' por un secreto fuerte
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: process.env.NODE_ENV === 'production', // Asegúrate de usar cookies seguras en producción
      maxAge: 1000 * 60 * 60 * 24, // Duración de la sesión: 1 día
    },
  })
);

// Inicializa flash
app.use(flash()); // Asegúrate de incluir esto

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos desde la carpeta "public"
app.use(express.static(path.join(process.cwd(), 'src/public')));

// Rutas del front-end
app.use('/', routesFrom);

// Rutas de la API
app.use('/api/v1/users', routesUser);
app.use('/api/v1/sistemas', routesSistemas);
// Inicia el servidor
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Servidor en el puerto ${PORT}`);
});
