import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { db } from "../../index.js";

export const userRoutes = express.Router();

userRoutes.post("/login", (req,res) => {

  const {email, password} = req.body

  console.log(email)
  console.log(password)

  if (!email || !password) return res.status(500).send("Campos vacio");

  db.query(
    "SElECT * FROM budgetly.users WHERE email=?",
    email,
    async (err, result) => {
      if (err)
        return res
          .status(500)
          .send({
            message: "Hubo un error al consultar la base de datos",
            error: err,
          });

      const user = result[0];

      if (!user)
        return res
          .status(401)
          .send({ message: "El usuario no existe!", error: err });

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch)
        return res
          .status(401)
          .send({ message: "Password entered is incorrect" });

      //**Create JWT */

      const payLoad = {
        id: user.userId,
        name: user.name,
        userEmail: user.email,
        avatar: user.imageUrl,
      };

      const token = jwt.sign(payLoad, process.env.SECRET_KEY, {
        expiresIn: "1h",
      });

      res.cookie("token", token, {
        httpOnly: true,
        secure: true,
        maxAge: 3600000,
      });

      res.status(201).send({ message: "Bienvenido!", user: payLoad });
    },
  );


});

userRoutes.get("/authenticate", (req, res) => {
  const token = req.cookies.token;

  if (!token)
    return res.status(401).send({ message: "Token no valido o expiraro" });

  const user = jwt.verify(token, process.env.SECRET_KEY);

  db.query('SELECT * FROM budgetly.users WHERE userId = ?', [user.id], (err,result) => {
    if(err) return res.status(500).send({message:'Occurrio un error'});
     const user = result[0]
    delete user.password && user.password;
    res.send({message:'autenticado correctamente', result:user})
  })



  // if (!user) res.status({ message: "Usuario no autenticado" });

  // res.status(201).send({ message: "Autenticado exitosamente", payload: user });
});

userRoutes.get("/logout", (req, res) => {
  const token = req.cookies.token;

  if (!token) return res.status(401).send({ message: "No estas autorizado" });
  res.clearCookie("token");
  res.send({ message: "Logout exitoso" });
});


