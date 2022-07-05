const express=require('express')
const router=express.Router()
const usersmodel=require('../models/user.js')
const gamemodel=require('../models/game.js')
const custommiddleware=require('../custommiddlewares/custommiddlewares.js')
const mapper=require('../Mapper/mapper.js')

router.post('/createuser',async (req,res)=>{
    let utente=new usersmodel({
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
})

router.patch('/addgamestouser/:userid',custommiddleware.Getsingleuser,async(req,res)=>{
    try {
        let gametoaddinfo={
            titolo:req.body.titolo,
            piattaforma:req.body.piattaforma
        }
        if(Object.keys(req.body).length<2) return res.status(400).json({message:`l'oggetto deve essere così composto {titolo:String,piattaforma:String}`})
       
        const usertoaddgame=await res.user
        if(usertoaddgame.deleted) return res.status(404).json({message:`Utente con id ${req.params.userid} non trovato`})
        const gametoadd=await gamemodel.findOne({titolo:gametoaddinfo.titolo,piattaforma:gametoaddinfo.piattaforma})
        if(gametoadd==null) return res.status(404).json({message:"il Gioco da aggiungere non è stato trovato"})
        if(usertoaddgame.Giochi.length>0){ //check che utente non abbia già il gioco
            let check=usertoaddgame.Giochi.includes(gametoadd.id)
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
})

router.get('/getsingleuserwithgames/:userid',async(req,res)=>{
    let limit=req.query.limit
    let user
    try {
        if(limit &&  !isNaN(limit) && limit>0){
            user=await usersmodel.findOne({_id:req.params.userid,deleted:false}).populate({
                path:'Giochi',
                perDocumentLimit:limit
            })
            if(user==null) return res.status(404).json({message:`Utente con id ${req.params.userid} non trovato`})
            return res.status(200).json(mapper.MapUsertoUserDto(user,true))
        }
        user=await usersmodel.findOne({_id:req.params.userid,deleted:false}).populate('Giochi')
        if(user==null) return res.status(404).json({message:`Utente con id ${req.params.userid} non trovato`})
        return res.status(200).json(mapper.MapUsertoUserDto(user,true))
    } catch (error) {
        return res.status(500).json({message:error.message})
    }
})

router.get('/getsingleuser/:userid',custommiddleware.Getsingleuser,async(req,res)=>{
    const usertofind=await res.user
    return res.status(200).json(mapper.MapUsertoUserDto(usertofind))
})

router.delete('/deleteuser/:userid',custommiddleware.Getsingleuser,async(req,res)=>{
    const usertodelete=await res.user
    try {
        if(usertodelete.deleted) return res.status(404).json({message:`Utente con id ${req.params.userid} non trovato`})
        usertodelete.deleted=true
        await usertodelete.save()
        return res.status(200)
    } catch (error) {
        return res.status(500).json({message:error.message})
    }
})



module.exports=router
