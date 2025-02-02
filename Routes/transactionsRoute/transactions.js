import express from 'express'
import { db } from "../../index.js";
import jwt from "jsonwebtoken";

import {S3Client, DeleteObjectCommand, S3} from '@aws-sdk/client-s3';
import {Upload} from '@aws-sdk/lib-storage'
import multer,{memoryStorage} from 'multer'

export const transactionsRoute = express.Router();

const myRegion = 'us-east-2'

const s3 = new S3Client({
  region:myRegion,
  credentials:{
    accessKeyId:process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey:process.env.AWS_SECRET_ACCESS_KEY
  }
});


transactionsRoute.get("/transacciones", (req, res) => {
  const token = req.cookies.token
  const payLoad = jwt.verify(token,process.env.SECRET_KEY);
  if (!payLoad) return res.status(401).send({message:'No autorizado'});
  const userId = payLoad.id;
    db.query('SELECT * FROM budgetly.gastos WHERE userId = ?',[userId], (err,result) => {
          const gastos = result;

          db.query('SELECT * FROM budgetly.presupuesto WHERE userId = ?',[userId], (err,result) => {
            const presupuestos = result;


            const fullData = gastos.concat(presupuestos)

            res.status(200).send({message:'Consulta exitosa',resultado:fullData})
    
           
        })

        

       
    })
  
});


transactionsRoute.delete('/deleteImg', async (req,res) => {
  const {url} = req.body
  const token = req.cookies.token;

  const payLoad = jwt.verify(token,process.env.SECRET_KEY);

  const userId = payLoad.id
  
  if(!url) return res.status(400).send({message:'Occurrio un error'});

  db.query('SELECT imageUrl FROM budgetly.users WHERE userId = ?',[userId], async (err,result) => {
    if(err) return res.send({message:'Occurrio un error', error:err});


    const imagePath = result[0].imageUrl;
    
    const key = imagePath.split(`${process.env.AWS_BUCKET}.s3.${myRegion}.amazonaws.com/`)[1]

   

    const params = {
      Bucket: process.env.AWS_BUCKET,
      Key:key,
    }


  
    try {
      const deleteComand = new DeleteObjectCommand(params);
    await s3.send(deleteComand);
    console.log('imagen eliminada de S3');
      
    } catch (s3Error) {
      console.log(s3Error)
      
    }


    

  })

  db.query('UPDATE budgetly.users SET imageUrl = NULL WHERE userId = ?', [userId, url],  (err, result) => {
    if(err) return res.send({message:'Occurrio un error', error:err});

    res.status(200).send({message:'imagen borrada exitosamente', resultado: result});
  })
  

})


