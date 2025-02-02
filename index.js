import express from "express";
import { json } from "express";
import cors from "cors";
import mysql from "mysql2";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

dotenv.config();

//**importar rutas start */
import { userRoutes } from "./Routes/Login/login.js";
import { register } from "./Routes/Login/register.js";
import { gastosRoute } from "./Routes/gastosAPI/gastos.js";
import { reportRoute } from "./Routes/presupuestoRoute/reportRoute.js";
import { middleWare } from "./middleWare.js";
import { ruteDeusuario } from "./Routes/presupuestoRoute/users.js";
import { profileRoute } from "./Routes/Login/register.js";
import { transactionsRoute } from "./Routes/transactionsRoute/transactions.js";
import { resetPasswordRoute } from "./Routes/resetPassword/resetPassword.js";

//**importar rutas end */

const PORT = 3000;

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

app.use(json());

app.use(cookieParser());

//**Definir Rutas START */
app.use("/api", userRoutes);
app.use("/api", register);
app.use("/api", resetPasswordRoute);

app.use("/api", middleWare, gastosRoute);
app.use("/api", middleWare, reportRoute);
app.use("/api",middleWare, ruteDeusuario);
app.use("/api", middleWare,profileRoute);
app.use("/api",middleWare,transactionsRoute)

//**Definir Rutas END */

export const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root",
  database: "Budgetly",
});

db.connect((err) => {
  if (err) {
    console.log(err);
    return;
  }
  console.log("Conectado con exito");
});

app.listen(PORT, () => {
  console.log(`Escuchando en el puerto ${PORT}`);
});
