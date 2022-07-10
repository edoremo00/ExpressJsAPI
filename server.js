require('dotenv').config()//carica i contenuti del mio file .env in process.env(NODE)
const express=require('express')//importo express
const cors=require('cors')
const app=express()//rappresenta il mio server
const mongoose=require('mongoose')//per connessione a mongodb


mongoose.connect(process.env.CONNECTIONSTRING).catch(error=>console.error(`connessione database fallita, Errore: ${connerror}`))/*ritorna una promise.
    eventi come connessione fallita li posso intercettare con il catch oppure aggiungere un listener
    a evento error come fatto qua sotto*/
//mongoose.connection rappresenta nostra connessione a database
//ho una serie di eventi che mi informano anche sullo stato della connessione
//mongoose.connection.on('error',(connerror)=>console.error(`connessione database fallita, Errore: ${connerror}`))
//callback che viene invocata in caso di errore connessione con DB

app.get('/',(req,res)=>{//test funzionamento server
    res.send("<h1>ciao</h1>")
})

app.use(express.json())//server così accetterà JSON

app.use(cors({
    origin:'http://localhost:4200',//configuro CORS
}))


const games=require('./routes/games')//definisco le route in un altro file e le importo. ho definito quindi un middleware
const users=require('./routes/users.js')
app.use('/games',games)
app.use('/users',users)
app.listen(3000,()=>console.log("server in esecuzione"))

