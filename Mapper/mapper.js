const gamedto=require('../DTO/gameDTO.js')

function MapGametoGameDTO(game){
 return new gamedto(
    titolo=game.titolo,
    id=game._id,
    genere=game.genere,
    datapubblicazione=game.datapubblicazione,
    Sviluppatore=game.Sviluppatore,
    Prezzo=game.Prezzo
 )
}
module.exports.MapGametoGameDTO=MapGametoGameDTO