const express=require('express')
const router=express.Router()
const custommiddleware=require('../custommiddlewares/custommiddlewares.js')
const gamescontroller=require('../controllers/gamescontroller.js')
//qui setterò tutte le route per fare le CRUD su DB

router.get('/getallgames',gamescontroller.getAllGames)

router.get('/getgamebyid/:id',custommiddleware.getsingleGamemiddleware,gamescontroller.getGamebyId)

router.put('/updategame/:id',custommiddleware.getsingleGamemiddleware,gamescontroller.updateGame)

router.post('/creategame',gamescontroller.createGame)

router.delete('/deletegame/:id',custommiddleware.getsingleGamemiddleware,gamescontroller.deleteGame)

module.exports=router//esporto router