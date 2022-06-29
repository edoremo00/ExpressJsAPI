const gamedto=require('../DTO/gameDTO.js')
const dayjs=require('dayjs')

function MapGametoGameDTO(game){
 return new gamedto(
    titolo=game.titolo,
    id=game._id,
    genere=game.genere,
    datapubblicazione=dayjs(game.datapubblicazione).format('DD-MM-YYYY'),
    Sviluppatore=game.Sviluppatore,
    Prezzo=game.Prezzo
 )
}
module.exports.MapGametoGameDTO=MapGametoGameDTO