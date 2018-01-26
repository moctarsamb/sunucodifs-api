'use strict';

module.exports = function(Codification) {
  Codification.beforeRemote("create", ctx => {
    const data = ctx.args.data ;
    const cId = data.chambreId ;
    return Codification.findOne({where : { chambreId : cId , position : data.position}}).then(codif => {
      if(codif){
        const err = new Error();
        err.statusCode = 400;
        err.code = "POSITION_EXISTS";
        err.message = "POSITION DEJA RESERVE";
        throw err;
      }
      return Codification.app.models.Chambre.findOne({where : { id : cId }}).then(room => {
        if(!room){
          const err = new Error();
          err.statusCode = 404;
          err.code = "USER_NOT_FOUND";
          err.message = "COMPTE INTROUVABLE";
          throw err;
        }
        if (room.reserve) {
          const err = new Error();
          err.statusCode = 400;
          err.code = "CODIFICATION_EXISTS";
          err.message = "CHAMBRE DEJA RESERVE";
          throw err;
        }
        return Promise.resolve();
      })
    })

  });
  Codification.afterRemote("create", (ctx, data) => {
    const cId = data.chambreId ;
    return Codification.app.models.Chambre.findOne({where : { id : cId }}).then(room => {
      const nzwnbres = room.nbposres - 1 ;
            room.updateAttribute("nbposres", nzwnbres);
            room.updateAttribute("reserve", nzwnbres === 0);
            return Promise.resolve();
    })
  });
  Codification.beforeRemote("deleteById", (ctx) => {
    const data = ctx.args ;
    return Codification.findOne({where : { id : data.id}}).then(codif => {
      if(!codif){
        const err = new Error();
        err.statusCode = 400;
        err.code = "CODIFICATION_NOT_FOUND";
        err.message = "CHAMBRE DEJA RESERVE";
        throw err;
      }
      const cId = codif.chambreId ;
      return Codification.app.models.Chambre.findOne({where : { id : cId }}).then(room => {
        console.log(room);
        const nzwnbres = room.nbposres + 1 ;
        room.updateAttribute("nbposres", nzwnbres);
        room.updateAttribute("reserve", nzwnbres === 0);
        return Promise.resolve();
      })
    } )
  });
};
