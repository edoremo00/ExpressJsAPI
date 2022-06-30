const express=require('express')
const router=express.Router()
const gamemodel=require('../models/game.js')
const mapper=require('../Mapper/mapper.js')
const custommiddleware=require('../custommiddlewares/custommiddlewares.js')

//qui setterò tutte le route per fare le CRUD su DB

router.get('/getallgames',async(req,res)=>{
    let limit=req.query.limit//parametro opzionale in query string per limitare numero risultati query
    try{
        if(limit){
            if(isNaN(limit)) return res.status(400).json({message:"limit non è un numero"})
            if(limit <=0) return res.status(400).json({message:"limit deve essere maggiore di 0"})
            const games=await gamemodel.find({deleted:false}).limit(Number(limit))
            if(games.length>0){
              return res.status(200).json(games.map(game=>mapper.MapGametoGameDTO(game)))
            } 
            return res.status(204)
        }
        const games=  await gamemodel.find({deleted:false})
       return res.status(200).json(games.map(g=>mapper.MapGametoGameDTO(g)))
    }catch(err){
        res.status(500).json({message:err.message})
    }
})

router.get('/getgamebyid/:id',custommiddleware.getsingleGamemiddleware,async(req,res)=>{
    try{
        let gametofind=await res.game
        if(gametofind==null||gametofind.deleted===true) return res.status(404).json({message:`Gioco con id ${req.params.id} non trovato`})
        return res.status(200).json(mapper.MapGametoGameDTO(gametofind))
    }
    catch(error){
        return res.status(500).json({message:error.message})
    }
})

router.put('/updategame/:id',custommiddleware.getsingleGamemiddleware,async(req,res)=>{
    try{
        const gametoupdate=await res.game//risposta del middleware è in res.game
        gametoupdate.titolo=req.body.titolo ?? gametoupdate.titolo
        gametoupdate.genere=req.body.genere ?? gametoupdate.genere,
        gametoupdate.datapubblicazione=req.body.datapubblicazione ??  gametoupdate.datapubblicazione,
        gametoupdate.Sviluppatore=req.body.Sviluppatore ??  gametoupdate.Sviluppatore,
        gametoupdate.Prezzo=req.body.Prezzo ??  gametoupdate.Prezzo,
        gametoupdate.deleted=req.body.deleted ?? gametoupdate.deleted

        const updatedgame= await gametoupdate.save()
        return res.status(200).json(mapper.MapGametoGameDTO(updatedgame))
    }catch(error){
        return res.status(500).json({message:error.message})
    }
})

router.post('/creategame',async(req,res)=>{
    let gioco=new gamemodel({
        titolo:req.body.titolo,
        genere:req.body.genere,
        datapubblicazione:req.body.datapubblicazione,
        Sviluppatore:req.body.Sviluppatore,
        Prezzo:req.body.Prezzo,
        piattaforma:req.body.piattaforma
    })
    //check di avere nel body almeno i campi obbligatori
    if(Object.keys(req.body).length<3) return res.status(400).json({message:"Oggetto passato nel body non completo"})
    try{
        //VERIFICO CHE GIOCO NON SIA GIà IN CATALOGO
        let check=await gamemodel.findOne({titolo:{$eq:gioco.titolo},piattaforma:{$eq:gioco.piattaforma},Sviluppatore:{$eq:gioco.Sviluppatore},deleted:false})
        if(check) return res.status(400).json({message:"Gioco già in catalogo"})
      const gametosave=  await gioco.save()
      let gamemapped=mapper.MapGametoGameDTO(gametosave)
      return res.status(201).json(gamemapped)
    }catch(err){
        return res.status(400).json({message:err.message})
    }
})

router.delete('/deletegame/:id',custommiddleware.getsingleGamemiddleware,async(req,res)=>{
    try{
        const gametodelete=await res.game
        if(gametodelete.deleted ===true) return res.status(404).json({message:`Gioco con id ${req.params.id} non trovato`})
        gametodelete.deleted=true
        await gametodelete.save()
        return res.status(200).json()
    }catch(error){
        return res.send(500).json({message:error.message})
    }
})

module.exports=router//esporto router