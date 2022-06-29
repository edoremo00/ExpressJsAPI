const mongoose=require('mongoose')

const gameschema=new mongoose.Schema({
    titolo:{type:String,required:[true,"Il campo Titolo è richiesto"],unique:true},
    genere:{type:String,enum:["Sparatutto","Avventura","Racing","Sport","MMORPG","Picchiaduro","GDR","FPS","TPS","Altro"]},
    datapubblicazione:{type:Date,default:Date.now,max:Date.now},
    Sviluppatore:{type:String,required:[true,"il campo sviluppatore è richiesto"]},
    Prezzo:{type:Number,min:0,default:0},
    deleted:{ type: Boolean, default: false}
},{strict:false})//strict false consente di aggiungere campi che non avevo definito nello schema.
//io ho aggiunto campo deleted dopo che avevo giò tirato su il db
//dopodichè ho usato l'updatemany di mongoose per impostare a dati già presenti in DB il nuovo valore


module.exports=mongoose.model('Gioco',gameschema)//esportandolo posso usare questo modello per interagire con DB