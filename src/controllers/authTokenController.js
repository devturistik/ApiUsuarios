import jwt from "jsonwebtoken";
import authTokenService from "../application/authTokenService.js";

// Genera un token JWT si el usuario está autenticado
const loginToken = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await authTokenService.login(username, password);

    if (!user) {
      return res
        .status(401)
        .json({ message: "Usuario o contraseña incorrectos" });
    }

    const token = jwt.sign(
      { id: user._id, username: user.username, scope: user.scope },
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
