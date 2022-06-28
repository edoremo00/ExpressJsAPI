const express=require('express')
const router=express.Router()
const gamemodel=require('../models/game.js')
const mapper=require('../Mapper/mapper.js')

//qui setterò tutte le route per fare le CRUD su DB

router.get('/getallgames',async(req,res)=>{
    let limit=req.query.limit//parametro opzionale in query string per limitare numero risultati query
    try{
        if(limit){
            if(isNaN(limit)) return res.status(400).json({message:"limit non è un numero"})
            if(limit <=0) return res.status(400).json({message:"limit deve essere maggiore di 0"})
            const games=await gamemodel.find().limit(Number(limit))
            if(games.length>0){
              let mappedgames=games.map(game=>mapper.MapGametoGameDTO(game))
              return res.status(200).json(mappedgames)
            } 
            return res.status(204)
        }
        const games=  await gamemodel.find()
        res.status(200).json(games.map(g=>mapper.MapGametoGameDTO(g)))
    }catch(err){
        res.status(500).json({message:err.message})
    }
})

router.get('/getgamebyid/:id',async(req,res)=>{

})

router.post('/creategame',async(req,res)=>{
    let gioco=new gamemodel({
        titolo:req.body.titolo,
        genere:req.body.genere,
        datapubblicazione:req.body.datapubblicazione,
        Sviluppatore:req.body.Sviluppatore,
        Prezzo:req.body.Prezzo
    })
    try{
      const gametosave=  await gioco.save()
      let gamemapped=mapper.MapGametoGameDTO(gametosave)
      return res.status(201).json(gamemapped)
    }catch(err){
        return res.status(400).json({message:err.message})
    }
})

module.exports=router//esporto router