const mongoose=require('mongoose')

const userschema=new mongoose.Schema({
    name:{type:String,required:[true,"il campo nome è obbligatorio"]},
    datanascita:{type:Date,required:[true,"il campo datanascita è obbligatorio"]},
    fotoprofilo:{type:String},
    deleted:{type:Boolean,default:false},
    Giochi:[   
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'Gioco'
        }
    ]

})
module.exports=mongoose.model('Utente',userschema)