import express from 'express'
import { db } from "../../index.js";
import jwt from 'jsonwebtoken'

export const ruteDeusuario = express.Router()

 ruteDeusuario.get("/getAvatar", (req,res) => {
     
  
    const token = req.cookies.token
    const payLoad = jwt.verify(token,process.env.SECRET_KEY);

    if(!token) return res.status(401).send({message:'No autorizado'});

    db.query('SELECT * FROM budgetly.users WHERE userId = ?', [payLoad.id], (err,result) => {

      if(err) return res.status(500).send({message:'Occurrio un error en la base de datos', error:err});

      const user = result[0]
      const datos = {
        name:user.name,
        email:user.email,
        imagen:user.imageUrl
      }

      console.log(payLoad.id)

     
      res.send(datos)

    })
  
 
  })