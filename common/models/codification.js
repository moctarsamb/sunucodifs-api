'use strict';

module.exports = function(Codification) {
  Codification.beforeRemote("create", ctx => {
    const data = ctx.args.data ;
    const cId = data.chambreId ;
    const uId = data.etudiantId ;
    return Codification.findOne({where : {etudiantId: uId}}).then(etu => {
      if(etu) {
        const err = new Error();
        err.statusCode = 400;
        err.code = "ETUDIANT_EXISTS";
        err.message = "ETUDIANT DEJA CODIFIE";
        throw err;
      }
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

    } )

  });
  Codification.afterRemote("create", (ctx, data) => {
    const cId = data.chambreId ;
    const eId = data.etudiantId ;
    return Codification.app.models.Etudiant.findOne({where : {id: eId} }).then(etu => {
      return etu.updateAttribute("hasCodified", true).then(()=> {
        return Codification.app.models.Chambre.findOne({where : { id : cId }}).then(room => {
          const nzwnbres = room.nbposres - 1 ;
          room.updateAttribute("nbposres", nzwnbres);
          room.updateAttribute("reserve", nzwnbres === 0);
          return Promise.resolve();
        })
      } )
    })

  });

  Codification.beforeRemote("deleteById", (ctx) => {
    const data = ctx.args ;
    console.log(data)
    return Codification.findOne({where : { id : data.id}}).then(codif => {
      if(!codif){
        const err = new Error();
        err.statusCode = 400;
        err.code = "CODIFICATION_NOT_FOUND";
        err.message = "CHAMBRE DEJA RESERVE";
        throw err;
      }
      const eId = codif.etudiantId ;
      const cId = codif.chambreId ;
      return Codification.app.models.Etudiant.findOne({where : {id: eId} }).then(etu => {
        return etu.updateAttribute("hasCodified", false).then(()=> {
          return Codification.app.models.Chambre.findOne({where : { id : cId }}).then(room => {
            console.log(room);
            const nzwnbres = room.nbposres + 1 ;
            room.updateAttribute("nbposres", nzwnbres);
            room.updateAttribute("reserve", nzwnbres === 0);
            return Promise.resolve();
          })
        } )
      })

    } )
  });
  /**
   *
   * @param {null} request L'id de codif du demandeur et l'id de codif de l'echangé
   * @param {Function(Error, boolean)} callback
   */

  Codification.echanger = function(request) {
      return Codification.app.models.EchangeCode.findOne({where: {code: request.code}}).then(ech => {
        if(!ech) {
          const err = new Error();
          err.statusCode = 400;
          err.code = "CODE_NOT_FOUND";
          err.message = "Ce code n'existe pas";
          throw err;
        }
        if(ech.idRecEch !== request.idRec) return false ;
        const echangeParams = ech ;
        const emit = echangeParams.idUserEch ;
        const receive = echangeParams.idRecEch ;
        return ech.remove().then(()=> {
          return Codification.app.models.Etudiant.findOne({where: {id: emit}}).then((emitteur)=>{
            return emitteur.updateAttribute("hasEchReq",false).then(()=>{
              return Codification.app.models.Etudiant.findOne({where: {id: receive}}).then((recelleur)=> {
                return recelleur.updateAttribute("hasEchRec",false).then(()=>{
                  return Codification.findOne({where : {id: echangeParams.idChaUserEch}}).then(codif1 => {
                    return codif1.updateAttribute("etudiantId", echangeParams.idRecEch).then(()=> {
                      return Codification.findOne({where : {id: echangeParams.idChaRecEch}}).then(codif2 => {
                        return codif2.updateAttribute("etudiantId", echangeParams.idUserEch).then(() => {
                          return echangeParams.remove().then(() => true )
                        } )
                      })
                    })
                  })
                })
              })
            } )
          } )
        })

      } )
  };


};
