import express from 'express'
import { db } from '../../index.js';
import jwt from 'jsonwebtoken'
import nodemailer from 'nodemailer'
import cookieParser from 'cookie-parser';
import { hashPassword } from '../../Helpers/helpers.js';


export const resetPasswordRoute = express.Router();


resetPasswordRoute.post('/resetPassword', (req,res) => {
    const {email} = req.body;

    console.log(email)

    if(!email) return res.status(400).send({message:'Bad Request - No hay correo'});

    db.query('SELECT * FROM budgetly.users WHERE email = ?', [email], (err,result) => {
        if(err) return res.status(401).send({message:'Occurrion un error en la base de datos', error:err});


 
        const user = result[0]


        if(!user) return res.status(401).send({message:'El correo ingresado no esta registrado'});

      
        const payLoad = {
            userEmail:result[0].email,
            userId:user.userId
        }
        const token = jwt.sign(payLoad,process.env.SECRET_KEY, {expiresIn:'15m'})
        const resetLink = `/passwordreset`

        res.cookie('token',token,{
            httpOnly:true,
           
            maxAge:900000
        })

        res.status(200).send({ message: 'Correo de restablecimiento enviado' });

    
        

   
 const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'budgetlyes@gmail.com',
      pass: process.env.MAIL_PASS 
    }
  });
 
  const mailOptions = {
    from: 'budgetlyes@gmail.com',
    to: email,
    subject: 'Restablece tu contraseña',
    html: `
      <p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
      <a href="http://localhost:5173/passwordreset">Restablecer contraseña</a>
    `
  };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
              console.log('Error al enviar el correo:', error);
            } else {
              console.log('Correo enviado:', info.response);
            }
          });
      
        
    })

    
})

resetPasswordRoute.put('/setNewPassword', async (req,res) => {
    const token = req.cookies.token;
    const {newPasword} = req.body;

    console.log(newPasword)
    if (!newPasword) return res.status(400).send({message:'No se recibio contraseña!'});
    if (!token) return res.status(401).send({message:'Token no valido o expirado!'});
   
    const payLoad = jwt.verify(token,process.env.SECRET_KEY)
    const userId = payLoad.userId
     const encryptedPassword = await hashPassword(newPasword)

    db.query('UPDATE budgetly.users SET password =? WHERE userid =?',[encryptedPassword,userId], (err,result) => {
        if(err) return res.status(500).send({message:'Ocurrio un error', error:err});
        res.status(200).send({message:'Tu contraseña fue actualizada correctamente',resultado:result})
     
    })
    


    
})