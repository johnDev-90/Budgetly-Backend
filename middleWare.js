import jwt from "jsonwebtoken";

export const middleWare = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).send({ message: "Token no válido o expirado" });
  }

  try {
    const user = jwt.verify(token, process.env.SECRET_KEY);
    req.user = user; // Almacena el usuario para reutilizarlo en rutas protegidas
    next();
  } catch (error) {
    return res.status(401).send({
      message: "Token inválido o expirado",
      error: error.message,
    });
  }
};
