import express from "express";
import { db } from "../../index.js";
import jwt from "jsonwebtoken";
import { formatFechaToYYYYMMDD } from "../../../cliente/src/helpers/FormatMoney.js";

export const gastosRoute = express.Router();

gastosRoute.post("/nuevoGasto", (req, res) => {
  const { categoria, lugar, descripcion, amount } = req.body;

  const token = req.cookies.token;

  const user = jwt.verify(token, process.env.SECRET_KEY);

  const userId = user.id;

  if (!userId || !categoria || !lugar || !descripcion || !amount) {
    return res.status(500).send({ message: "No hay datos..." });
  }

  const VALUES = [userId, categoria, lugar, descripcion, amount];
  const query =
    "INSERT INTO budgetly.gastos(userId, categoria,lugarDeCompra,description,monto) VALUES(?,?,?,?,?)";

  db.query(query, VALUES, (err, result) => {
    if (err)
      return res
        .status(500)
        .send({ message: "Ocurrio un error en la base de datos", error: err });
    console.log(err);
    res.status(200).send({ message: "Gasto creado correctamente" });
    res.send();
  });
});

gastosRoute.get("/gastos", (req, res) => {
  const token = req.cookies.token;

  const user = jwt.verify(token, process.env.SECRET_KEY);

  const userId = user.id;

  db.query(
    "SELECT * FROM budgetly.gastos WHERE userId=?",
    userId,
    (err, result) => {
      if (err)
        return res
          .status(500)
          .send({ message: "Ocurrio un error con la peticion", error: err });
      res.send(result);
    },
  );
});

gastosRoute.get("/gasto/editarGasto/:id", (req, res) => {
  const { id } = req.params;

  if (!id) return res.status(500).send({ message: "No hay parametros" });

  const query = "SELECT * FROM budgetly.gastos WHERE gastoId=?";

  db.query(query, id, (err, result) => {
    if (err)
      return res.status(401).send({ message: "Ocurrio un error", error: err });

    res.send(result[0]);
  });
});

gastosRoute.put(`/gasto/update/:id`, (req, res) => {
  const { id } = req.params;
  const { userId, categoria, lugar, descripcion, amount, createdAt } = req.body;

  const query = `
    UPDATE budgetly.gastos SET categoria = ?, lugarDeCompra = ?, description = ?, monto = ? WHERE gastoId = ? AND userId = ?
`;
  const VALUES = [categoria, lugar, descripcion, amount, id, userId];

  db.query(query, VALUES, (err, result) => {
    if (err)
      return res
        .status(501)
        .send({ message: "Occurrio un error en la base de datos", error: err });
    console.log(result);

    res.status(201).send({ message: "Gasto actualizado exitosamente." });
  });
});

gastosRoute.delete("/gasto/borrar/:id", (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM budgetly.gastos WHERE gastoId=?", id, (err, result) => {
    if (err)
      return res
        .status(401)
        .send({ message: "Ocurrion un error en la base de datos", error: err });
    res.status(200).send({ message: "Cliente eliminado correctamente" });
  });
});

gastosRoute.get("/gasto/recentTransactions", (req, res) => {
  const token = req.cookies.token;

  const payLoad = jwt.verify(token, process.env.SECRET_KEY);
  if (!payLoad)
    return res
      .status(401)
      .send({ message: "Usuario no autorizado o token expirado" });

  const userId = payLoad.id;

  db.query(
    "SELECT * FROM budgetly.presupuesto WHERE userId = ?",
    userId,
    (err, result) => {
      if (err)
        return res.status({
          message: "Ocurrio un error en la consulta",
          error: err,
        });
      console.log(err);

      const todaysDate = new Date();
      const fechaFormateada = formatFechaToYYYYMMDD(todaysDate);

      /**PResupuesto por fecha */
      const presupuesto = result.filter(
        (item) => formatFechaToYYYYMMDD(item.created_at) === fechaFormateada,
      );

      /**Gastos por fecha */

      db.query(
        "SELECT * FROM budgetly.gastos WHERE userId = ?",
        userId,
        (err, result) => {
          if (err)
            return res
              .status(500)
              .send({ message: "Ocurrio un error", error: err });

          const todayExpensed = result.filter(
            (item) =>
              formatFechaToYYYYMMDD(item.created_at) === fechaFormateada,
          );

          const data = [...presupuesto, ...todayExpensed];

          res.send({ message: "Consulta exitosa", data });
        },
      );
    },
  );
});


gastosRoute.get('/gastos/category/:categoria',(req,res) => {

  const {categoria} = req.params;

  if(!categoria) return res.status(401).send({message:'Occurrio un error'});

  db.query('SELECT * FROM budgetly.gastos WHERE categoria = ?', categoria, (err,result) => {
    if(err) return res.status(500).send({message:'Occurrio un error en la consulta', error:err});
    
    res.send({message:'Consulta realisada correctamente', resultado:result});
  })


})
