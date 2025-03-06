import authService from "../application/authService.js";

// Manejo del proceso de login
export const loginApi = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await authService.login(email, password);

    if (!user) {
      return res.status(401).json({
        error: "Correo o contraseña incorrectos",
      });
    }

    res.status(200).json({
      message: "Inicio de sesión exitoso",
      user: user,
    });
  } catch (error) {
    if (error.message === "El usuario no está activado.") {
      return res.status(403).json({ error: error.message });
    }
    console.error("Error al iniciar sesión:", error);
    res.status(500).json({ error: "Error en el servidor" });
  }
};
