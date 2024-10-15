import authService from "../application/authService.js";

export const loginApi = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await authService.login(email, password);

    if (!user) {
      return res.status(401).json({
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
      rol: user.rol || "usuario",
    };

    res.status(200).json({
      message: "Inicio de sesión exitoso",
      user: req.session.user,
    });
  } catch (error) {
    if (error.message === "El usuario no está activado.") {
      return res.status(403).json({ error: error.message });
    }

    // Otros errores
    console.error("Error al iniciar sesión:", error);
    res.status(500).json({ error: "Error en el servidor" });
  }
};
