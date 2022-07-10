const mapper=require('../Mapper/mapper.js')
const usersmodel=require('../models/user.js')
const gamemodel=require('../models/game.js')
require('dotenv').config()
const { v4: uuidv4 } = require('uuid');
const { BlobServiceClient, BlobClient } = require("@azure/storage-blob");
const multer=require('multer')

const upload=multer({//configuro qua multer per farli accettare solo immagini
    fileFilter:(req,file,cb)=>{
       if(file.mimetype.startsWith('image')){
        cb(null,true)
       }else{
        return cb(new Error('Formato file non valido'),false)
       }
    }
})

const multerupload=upload.single("profilepic")


//POST
const createUser=async (req,res)=>{
    const utente=new usersmodel({
        name:req.body.name,
        datanascita:req.body.datanascita,
        Giochi:req.body.giochi

    })
    try{
        const usertosave=await utente.save()
        return res.status(201).json(usertosave)
    }catch(error){
        return res.status(500).json({message:error.message})
    }
}

//POST UPLOAD FOTO PROFILO
const uploadProfilePicture=async(req,res)=>{

    if(!req.file||Object.keys(req.file).length===0) return res.status(400).json({message:"file non specificato"})
   
    const user=await res.user
    //caricare file su azure blob storage e salvare link su DB 
    const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.BLOB_CONNECTION_STRING);
    const blobclient=blobServiceClient.getContainerClient(process.env.CONTAINER_NAME)
    let blobname=String().concat(uuidv4(),".",req.file.originalname.split('.').pop())
    //metodo pop rimuove ultimo elemento da array e ti ritorna quell'elemento
    const blockblobclient=blobclient.getBlockBlobClient(blobname)
    try {
        const uploadresponse=await blockblobclient.uploadData(req.file.buffer).catch(e=>console.warn(e))
        if(uploadresponse._response.status===201){
            //problema che non ritornava nulla era-->return res.status(200)
            //questo però setta solo lo status code della risposta a 200 ma non termina il processo di risposta.
            //così facendo il tutto rimaneva in waiting
            //per terminare processo di risposta ho oltre a json altri due metodi che sono end() e send()
            //end lo uso per terminare la risposta senza alcun dato,send se devo mandare dei dati non json però.
            user.fotoprofilo=blockblobclient.url
            await user.save()
            return res.status(200).end()
        }
        return res.status(500).json({message:"Errore in caricamento File"})
    } catch (error) {
        return res.status(500).json({message:error.message})
    } 
}

//GET
const getSingleUser=async(req,res)=>{
    const usertofind=await res.user
    return res.status(200).json(mapper.MapUsertoUserDto(usertofind))
}

//GET CON GIOCHI
const getSingleUserwithGames=async(req,res)=>{
    const limit=req.query.limit
    let user
    try {
        if(limit &&  !isNaN(limit) && limit>0){
            user=await usersmodel.findOne({_id:req.params.userid,deleted:false}).populate({
                path:'Giochi',
                perDocumentLimit:limit
            })
            if(!user) return res.status(404).json({message:`Utente con id ${req.params.userid} non trovato`})
            return res.status(200).json(mapper.MapUsertoUserDto(user,true))
        }
        user=await usersmodel.findOne({_id:req.params.userid,deleted:false}).populate('Giochi')
        if(user==null) return res.status(404).json({message:`Utente con id ${req.params.userid} non trovato`})
        return res.status(200).json(mapper.MapUsertoUserDto(user,true))
    } catch (error) {
        return res.status(500).json({message:error.message})
    }
}

const getAllusers=async(req,res)=>{
    let limit=req.query.limit//parametro opzionale in query string per limitare numero risultati query
    try{
        if(limit){
            if(isNaN(limit)) return res.status(400).json({message:"limit non è un numero"})
            if(limit <=0) return res.status(400).json({message:"limit deve essere maggiore di 0"})
            const users=await usersmodel.find({deleted:false}).limit(Number(limit))
            if(users.length>0){
              return res.status(200).json(users.map(user=>mapper.MapUsertoUserDto(user)))
            } 
            return res.status(204)
        }
        const users=  await usersmodel.find({deleted:false})
       return res.status(200).json(users.map(u=>mapper.MapUsertoUserDto(u)))
    }catch(err){
        res.status(500).json({message:err.message})
    }
}

//PATCH
const addgamesToUser=async(req,res)=>{
    try {
        const gametoaddinfo={
            titolo:req.body.titolo,
            piattaforma:req.body.piattaforma
        }
        if(Object.keys(req.body).length<2) return res.status(400).json({message:`l'oggetto deve essere così composto {titolo:String,piattaforma:String}`})
       
        const usertoaddgame=await res.user
        if(usertoaddgame.deleted) return res.status(404).json({message:`Utente con id ${req.params.userid} non trovato`})
        const gametoadd=await gamemodel.findOne({titolo:gametoaddinfo.titolo,piattaforma:gametoaddinfo.piattaforma})
        if(gametoadd==null) return res.status(404).json({message:"il Gioco da aggiungere non è stato trovato"})
        if(usertoaddgame.Giochi.length>0){ //check che utente non abbia già il gioco
            const check=usertoaddgame.Giochi.includes(gametoadd.id)
           if(check){
            return res.status(400).json({message:"L'utente possiede già il gioco"})
           }
           usertoaddgame.Giochi.push(gametoadd)
           const updateduser=await usertoaddgame.save()
           //NOTA: CON MONGOOSE è POSSIBILE FARE GLI UPDATE SIA TRAMITE LE QUERY COME UPDATEONE, UPDATEMANY ECC SIA MODIFICANDO L'OGGETTO
           //RICEVUTO DA QUERY COME FIND PERCHè ESSE RESTITUISCONO DEI DOCUMENTI. QUANDO NOI CHIAMIAMO IL METODO SAVE
           //MONGOOSE FA QUERY DI UPDATE SUL DATABASE SALVANDO I DATI ECCO PERCHè RIGA SEGUENTE è COMMENTATA IDEM RIGA 49
           //https://mongoosejs.com/docs/documents.html#updating-using-queries
           //const updateduser= await usersmodel.updateOne({_id:usertoaddgame._id},{$push:{Giochi:gametoadd}})
            return res.status(200).json(mapper.MapUsertoUserDto(updateduser,true))
          
        }
       //const updateduser=await usersmodel.updateOne({_id:usertoaddgame._id},{$push:{Giochi:gametoadd}})
       usertoaddgame.Giochi.push(gametoadd)
       const updateduser=await usertoaddgame.save()
       return res.status(200).json(mapper.MapUsertoUserDto(updateduser,true))
    } catch (error) {
        return res.status(500).json({message:error.message})
    }
}

//DELETE
const deleteUser=async(req,res)=>{
    let usertodelete=await res.user
    try {
        if(usertodelete.deleted) return res.status(404).json({message:`Utente con id ${req.params.userid} non trovato`})
        usertodelete.deleted=true
        await usertodelete.save()
        return res.status(200)
    } catch (error) {
        return res.status(500).json({message:error.message})
    }
}


module.exports={
    createUser,
    getSingleUser,
    getSingleUserwithGames,
    getAllusers,
    addgamesToUser,
    deleteUser,
    uploadProfilePicture,
    multerupload
}