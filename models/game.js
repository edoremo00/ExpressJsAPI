const mongoose=require('mongoose')

const gameschema=new mongoose.Schema({
    titolo:{type:String,required:[true,"Il campo Titolo è richiesto"],unique:true},
    genere:{type:String,enum:['Sparatutto,Avventura,Racing,Sport,MMORPG','Picchiaduro','GDR','Altro']},
    datapubblicazione:{type:Date,default:Date.now,max:Date.now},
    Sviluppatore:{type:String,required:[true,"il campo sviluppatore è richiesto"]},
    Prezzo:{type:Number,min:0,default:0}
})

module.exports=mongoose.model('Gioco',gameschema)//esportandolo posso usare questo modello per interagire con DB