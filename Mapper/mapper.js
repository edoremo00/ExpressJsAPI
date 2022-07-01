const gamedto=require('../DTO/gameDTO.js')
const userdto=require('../DTO/userDTO.js')
const dayjs=require('dayjs')

function MapGametoGameDTO(game){
 return new gamedto(
    titolo=game.titolo,
    id=game._id,
    genere=game.genere,
    datapubblicazione=dayjs(game.datapubblicazione).format('DD-MM-YYYY'),
    Sviluppatore=game.Sviluppatore,
    piattaforma=game.piattaforma,
    Prezzo=game.Prezzo
 )
}

function MapUsertoUserDto(user,withgames=false){
   if(withgames){
      let userdtoobj= new userdto(
         nome=user.name,
         id=user.id,
         datanascita=dayjs(user.datanascita).format('DD-MM-YYYY'),
         fotoprofilo=user?.fotoprofilo 
      )
      userdtoobj.Giochi=user?.Giochi.map((g)=>MapGametoGameDTO(g))
      return userdtoobj
   }
   return new  userdto(
      nome=user.name,
      id=user._id,
      datanascita=dayjs(user.datanascita).format('DD-MM-YYYY'),
      fotoprofilo=user?.fotoprofilo,
   )
}
module.exports.MapGametoGameDTO=MapGametoGameDTO
module.exports.MapUsertoUserDto=MapUsertoUserDto