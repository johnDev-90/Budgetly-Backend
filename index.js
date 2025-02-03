import express from "express";
import { json } from "express";
import cors from "cors";
import mysql from "mysql2";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

dotenv.config();

//**importar rutas start */
import { PORT,DB_HOST,DB_NAME,DB_PASSWORD,DB_USER,DB_PORT } from "./config.js";

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
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
});

// export const db = mysql.createConnection({
//   host: process.env.DB_HOST || "localhost", // Usa las variables de entorno
//   user: process.env.DB_USER,
//   password: process.env.DB_PASS,
//   database: process.env.DB_NAME,
//   port: process.env.DB_PORT || 3000,
//   waitForConnections: true,
//   connectionLimit: 10,
//   queueLimit: 0,
// });

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
