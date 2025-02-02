import express from "express";
import { hashPassword } from "../../Helpers/helpers.js";
import dotenv from 'dotenv'

dotenv.config()

import {S3Client, DeleteObjectCommand} from '@aws-sdk/client-s3';
import {Upload} from '@aws-sdk/lib-storage'
import multer,{memoryStorage} from 'multer'

import { db } from "../../index.js";

export const register = express.Router();
export const profileRoute = express.Router();

const myRegion = 'us-east-2'


const s3 = new S3Client({
  region:myRegion,
  credentials:{
    accessKeyId:process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey:process.env.AWS_SECRET_ACCESS_KEY
  }
});

const storage = multer.memoryStorage();
const upload = multer({storage});


register.post("/register", upload.single('imgProfile'), async (req, res) => {
  const { FirstName, LastName, email, password } = req.body;

 
  let imageURL;


   if (req.file !== undefined) {
    const imgProfile = req.file;

  
    const key = `imagenes/${Date.now()}-${imgProfile.originalname}`;
    const uploadParams = {
    Bucket:process.env.AWS_BUCKET,
    Key:key,
    Body:imgProfile.buffer,
    ContentType:imgProfile.mimetype,
  }

  imageURL = `https://${process.env.AWS_BUCKET}.s3.${myRegion}.amazonaws.com/${key}`

  const uploadCommand = new Upload({
    client:s3,
    params:uploadParams
  });

  

  await uploadCommand.done()
   }
  


  if (!FirstName || !LastName || !email || !password)
    return res.status(401).send("Error: campos vacios");

  const encryptedPassword = await hashPassword(password);

 
   

  
  const VALUES = [FirstName, LastName, email, imageURL , encryptedPassword];

  db.query(
    "INSERT iNTO budgetly.users(name, lastName, email, imageUrl, password) VALUES(?,?,?,?,?)",
    VALUES,
    (err, result) => {
      if (err)
        return res
          .status(500)
          .send({ message: "Ocurrio un error", error: err });

      res
        .status(201)
        .send({ message: "Registrado correctamente..", result: result });
    },
  );
});





profileRoute.put('/editProfile', upload.single('imgProfile'), (req,res) => {

  const {userId, nombre, apellido, email} = req.body;


 /**Obtener url de la imagen a elimanr desde la base de datos*/

 db.query('SELECT imageUrl FROM budgetly.users WHERE userId = ?', userId, async (err,result) => {
  if(err) return console.log(`Ocurrio un error`, err);

  const currentImage = result[0].imageUrl
  console.log(typeof currentImage)
  
 if (currentImage !== null) {
  const key1 = currentImage.split(`${process.env.AWS_BUCKET}.s3.${myRegion}.amazonaws.com/`)[1];

  const params ={
    Bucket:process.env.AWS_BUCKET,
    Key:key1,
  };
 
 try {
  const deletComand = new DeleteObjectCommand(params);
  await s3.send(deletComand);
  console.log('Imagen eliminada del s3')
 } catch (s3Error) {
  console.log(`Error al eliminar la imagen del s3`, s3Error)
  return res.status(500).send('Erro al eliminar la imagen del servidor');
 }
 };



  /**Actualizar la imagen nueva*/

  const imgProfile = req.file;

  const key2 = `imagenes/${Date.now()}-${imgProfile.originalname}`;


  const uploadParams = {
    Bucket:process.env.AWS_BUCKET,
    Key:key2,
    Body:imgProfile.buffer,
    ContentType:imgProfile.mimetype,
  }

  const uploadCommand = new Upload({
    client:s3,
    params:uploadParams
  });

  await uploadCommand.done()

  

 

  if (!nombre || !apellido ||  !email)
    return res.status(401).send("Error: campos vacios");

  // const encryptedPassword = await hashPassword(password);

  const imageURL = `https://${process.env.AWS_BUCKET}.s3.${myRegion}.amazonaws.com/${key2}`


  const VALUES = [nombre, apellido, email, imageURL, userId];
  const query = 'UPDATE budgetly.users SET name = ?, lastName = ?, email = ?, imageUrl = ? WHERE userId = ?'

  db.query(query, VALUES, (err,result) => {
    if(err) return res.status(500).send({message:'Occurrio un error', err});

    res.send({message:'Usurario actualizado correctamente', result:result})

  
    res.send()
  })


  
 })



 

} )