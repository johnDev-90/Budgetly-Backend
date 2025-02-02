import express from "express";
import { db } from "../../index.js";
import jwt from "jsonwebtoken";

export const reportRoute = express.Router();

reportRoute.post("/presupuesto", (req, res) => {
  const token = req.cookies.token;
  const { presupuesto } = req.body;

  const payLoad = jwt.verify(token, process.env.SECRET_KEY);

  if (!payLoad || !presupuesto)
    return res.status(401).send({ message: "No autorizado" });

  db.query(
    "INSERT iNTO budgetly.presupuesto(userId,presupuesto) VALUES(?,?)",
    [payLoad.id, presupuesto],
    (err, result) => {
      if (err)
        return res
          .status(500)
          .send({
            message: "Ocurrio un error en la base de datoss",
            error: err,
          });
      console.log(result);
      res.status(200).send({ message: "Empezemos", result: result });
    },
  );
});

reportRoute.get("/presupuesto", (req, res) => {
  const token = req.cookies.token;

  const payLoad = jwt.verify(token, process.env.SECRET_KEY);
  const id = payLoad.id;

  db.query(
    "SELECT * FROM budgetly.presupuesto WHERE userId = ?",
    id,
    (err, result) => {
      if (err)
        res
          .status(500)
          .send({
            message: "Ocurrio un error en la base de datos",
            result: result,
          });

      res.status(200).send({ message: "Consulta exitosa", result: result });
    },
  );
});

