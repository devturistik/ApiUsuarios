import jwt from "jsonwebtoken";
import authTokenService from "../application/authTokenService.js";

// Genera un token JWT si el usuario está autenticado
const loginToken = async (req, res) => {
  try {
    const { username, password } = req.body;
    const sistema = await authTokenService.login(username, password);

    if (!sistema) {
      return res
        .status(401)
        .json({ message: "Usuario o contraseña incorrectos" });
    }

    const token = jwt.sign(
      { id: sistema._id, username: sistema.username, scope: sistema.scope },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({ token });
  } catch (error) {
    console.error("Error al iniciar sesión:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
};

export default loginToken;
