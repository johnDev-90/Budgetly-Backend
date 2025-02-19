import express from "express";
import { json } from "express";
import cors from "cors";
import mysql from "mysql2";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

dotenv.config();



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
app.use(express.json());
const PORT = Number(process.env.DB_PORT )|| 3000



app.use(
  cors({
    origin:"http://localhost:5173",
    credentials: true,
  }),
);



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

// mysql://root:rjLUPNuxDXnUfQDzCDNNevWxqKVDARsd@autorack.proxy.rlwy.net:15902/railway


export const db = mysql.createConnection({
  host:process.env.DB_HOST,
  user:process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  PORT:process.env.DB_PORT || 3306
  
});

db.connect((err) => {
  if (err) {
    console.error("Error de conexión a la base de datos:");
    console.error("Detalles del error:", err); // Imprime el objeto de error completo

    return; // Importante: Detén la ejecución si hay un error
  }
  console.log("¡Conexión exitosa a la base de datos!");
});

app.listen(PORT, () => {
  console.log(`escuchando en el puerto ${PORT}`)
})