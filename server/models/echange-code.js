'use strict';
const Chance = require("chance");
const Promise = require("bluebird");
const QRCode = require('qrcode')

const NodeMailer = require("nodemailer");
const transporter = NodeMailer.createTransport({
  service: "Gmail",
  secure: true,
  port: 465,
  auth: {
    user: "joloftrtest@gmail.com",
    pass: "passeras"
  }
});

module.exports = function(Echangecode) {

  /**
   * Supprimer
   * @param {any} request
   * @param {Function(Error, boolean)} callback
   */

  Echangecode.supprimer = function(request) {
    const type = request.type;
    const req = request.id;
    if(type === "emit"){
      return Echangecode.findOne({where : { idUserEch: req }}).then(echCode => {
        console.log(request.id);
        console.log(echCode);
        const data = echCode;
        const receveur = data.idRecEch;
        const emetteur = data.idUserEch;
        return echCode.remove().then(()=> {
          return Echangecode.app.models.Etudiant.findOne({where: {id : emetteur}}).then(emit => {
            const emitted = emit ;
            return emit.updateAttribute("hasEchReq", false).then(()=> {
              const mailOptions = {
                from: "SunuCodifs <contact@sunucodifs.com>",
                to: emitted.email,
                subject: "Echange Codification Annulé ",
                text: `Votre demande d' échange a été annulée ou refusée`
              };
              transporter.sendMail(mailOptions)
                .then(info => {
                  if (!info) {
                    const err = new Error();
                    err.statusCode = 500;
                    err.code = "EMAIL_NOT_SENT";
                    err.message = "PROBLEME SERVEUR MAIL";
                    throw err;
                  }
                })
              return Echangecode.app.models.Etudiant.findOne({where: {id : receveur}}).then(etu => {
                const mail = etu.email ;
                return etu.updateAttribute("hasEchRec",false).then(()=> {
                  const mailOptions = {
                    from: "SunuCodifs <contact@sunucodifs.com>",
                    to: mail,
                    subject: "Echange Codification Annulé ",
                    text: `La demande d'echange de L'etudiant ${emitted.prenom} ${emitted.nom} a été annulée ou rejeté`,

                  };
                  transporter.sendMail(mailOptions)
                    .then(info => {
                      if (!info) {
                        const err = new Error();
                        err.statusCode = 500;
                        err.code = "EMAIL_NOT_SENT";
                        err.message = "PROBLEME SERVEUR MAIL";
                        throw err;
                      }
                    })
                  return true;
                } )
              })


            } )

          })

        } )
      } )
    }
    else {
      return Echangecode.findOne({where : { idRecEch:  request.id }}).then(echCode => {
        console.log(request.id);
        console.log(echCode);
        const data = echCode;
        const receveur = data.idRecEch;
        const emetteur = data.idUserEch;
        return echCode.remove().then(()=> {
          return Echangecode.app.models.Etudiant.findOne({where: {id : emetteur}}).then(emit => {
            const emitted = emit ;
            return emit.updateAttribute("hasEchReq", false).then(()=> {
              const mailOptions = {
                from: "SunuCodifs <contact@sunucodifs.com>",
                to: emitted.email,
                subject: "Echange Codification Annulé ",
                text: `Votre demande d' échange a été annulée ou refusée`
              };
              transporter.sendMail(mailOptions)
                .then(info => {
                  if (!info) {
                    const err = new Error();
                    err.statusCode = 500;
                    err.code = "EMAIL_NOT_SENT";
                    err.message = "PROBLEME SERVEUR MAIL";
                    throw err;
                  }
                })
              return Echangecode.app.models.Etudiant.findOne({where: {id : receveur}}).then(etu => {
                const mail = etu.email ;
                return etu.updateAttribute("hasEchRec",false).then(()=> {
                  const mailOptions = {
                    from: "SunuCodifs <contact@sunucodifs.com>",
                    to: mail,
                    subject: "Echange Codification Annulé ",
                    text: `La demande d'echange de L'etudiant ${emitted.prenom} ${emitted.nom} a été annulée ou rejeté`,

                  };
                  transporter.sendMail(mailOptions)
                    .then(info => {
                      if (!info) {
                        const err = new Error();
                        err.statusCode = 500;
                        err.code = "EMAIL_NOT_SENT";
                        err.message = "PROBLEME SERVEUR MAIL";
                        throw err;
                      }
                    })
                  return true;
                } )
              })


            } )

          })

        } )
      } )

    }
  };


  Echangecode.afterRemote("create", (ctx, data) => {
      const receveur = data.idRecEch;
      const emetteur = data.idUserEch;
      const code = data.code;
      return Echangecode.app.models.Etudiant.findOne({where: {id : emetteur}}).then(emit => {
        const emitted = emit ;
        return emit.updateAttribute("hasEchReq", true).then(()=> {
          return Echangecode.app.models.Etudiant.findOne({where: {id : receveur}}).then(etu => {
            const idRec = etu.id ;
            const mail = etu.email ;
            const qrData = {
              idRec: idRec,
              code: code
            };
            return etu.updateAttribute("hasEchRec",true).then(()=> {
              QRCode.toDataURL(JSON.stringify(qrData), function (err, url) {
                const mailOptions = {
                  from: "SunuCodifs <contact@sunucodifs.com>",
                  to: mail,
                  subject: "Verification Echange Codification",
                  text: `L'etudiant ${emitted.prenom} ${emitted.nom} voudrait echanger sa chambre avec la votre. Le Code de verification est ${code}`,
                  attachments : [
                    {   // utf-8 string as an attachment
                      filename: 'qrcode.png',
                      href : url
                    }
                  ]
                };
                transporter.sendMail(mailOptions)
                  .then(info => {
                    if (!info) {
                      const err = new Error();
                      err.statusCode = 500;
                      err.code = "EMAIL_NOT_SENT";
                      err.message = "PROBLEME SERVEUR MAIL";
                      throw err;
                    }
                  })
              })
            } )

          })


        } )

      })
  })

};
