const express=require('express')
const gamemodel=require('../models/game.js')
const mongoose=require('mongoose')


async function getsingleGamemiddleware(req,res,next){
    /*middleware custom che ricerca oggetto in db. ciò mi permette di evitare
        di riscrivere la query più volte. uso semplicemente il middleware*/
    let gametofind
    try{
        if(!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({message:"id in formato non valido"})
        gametofind=gamemodel.findById(req.params.id)
        if(gametofind==null){
            return res.status(404).json({message:`Gioco con id ${req.params.id} non trovato`})
        }
    }catch(error){
        return res.status(500).json({message:error.message})
    }
    res.game=gametofind//ritorno la risposta al metodo che ha invocato il middleware
    next()//continuo la richiesta che ha invocato il middleware
    
}

//#region TEST MIDDLEWARE CON PARAMETRI

const getsingleGamemiddlewarewithparams=(finddeleted)=>{
    return async(req,res,next)=>{
        try{
            if(!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({message:"id in formato non valido"})
           finddeleted ? gametofind=await gamemodel.findOne({_id:req.params.id,deleted:true}) : gametofind=await gamemodel.findOne({_id:req.params.id,deleted:false})
            if(gametofind==null){
                return res.status(404).json({message:`Gioco con id ${req.params.id} non trovato`})
            } 
           
        }catch(error){
            return res.status(500).json({message:error.message})
        }
        res.game=gametofind//ritorno la risposta al metodo che ha invocato il middleware
        next()//continuo la richiesta che ha invocato il middleware
    }
}

//se withdeleted è true mi ritorna anche i giochi cancellati
//altrimenti no
//se non passato cerco solo i giochi NON CANCELLATI
/*function getsingleGamemiddlewarewithparams(withdeleted=false){//non funziona e viene viene chiamata subito
    return async (req,res,next)=>{   
        let gametofind
        try{
            if(!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({message:"id in formato non valido"})
           withdeleted ? gametofind=await gamemodel.findById(req.params.id) : gametofind=await gamemodel.findOne({_id:req.params.id,deleted:false})
            if(gametofind==null){
                return res.status(404).json({message:`Gioco con id ${req.params.id} non trovato`})
            }
        }catch(error){
            return res.status(500).json({message:error.message})
        }
        res.game=gametofind//ritorno la risposta al metodo che ha invocato il middleware
        next()//continuo la richiesta che ha invocato il middleware
    }
}*/

//TODO modificare middleware se viene passato booleano finddeleted a true deve ricercarmi anche quelli cancellati
//middleware con parametro verrà usato nella PUT
//vedi qua per come fare: https://tsmx.net/express-middleware-function-with-custom-parameters/

//module.exports.getsingleGamemiddlewarewithparams=getsingleGamemiddlewarewithparams
//#endregion
module.exports.getsingleGamemiddlewarewithparams=getsingleGamemiddlewarewithparams
module.exports.getsingleGamemiddleware=getsingleGamemiddleware

