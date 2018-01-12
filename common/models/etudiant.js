'use strict';
const Chance = require("chance");
const Promise = require("bluebird");
const NodeMailer = require("nodemailer");
const transporter = NodeMailer.createTransport({
  service: "gmail",
  secure: false,
  port: 25,
  auth: {
    user: "joloftrtest@gmail.com",
    pass: "passeras"
  },
  tls: {
    rejectUnauthorized: false
  }
});
module.exports = function(Etudiant) {

  Etudiant.afterRemote("create", (req, user) => {
    const tem = new Chance();
  const verifCode = tem.hash({ length: 6 });
  return user.codeVerif
    .create({ code: verifCode, date: new Date() })
    .then(() => {
    //f6bd0a
    const mailOptions = {
      from: "SunuCodifs <contact@sunucodifs.com>",
      to: user.email,
      subject: "Verification Compte",
      text: `Votre Code de verification est ${verifCode}`
    };
  transporter
    .sendMail(mailOptions)
    .then(info => {
    if (!info) {
    const err = new Error();
    err.statusCode = 500;
    err.code = "EMAIL_NOT_SENT";
    err.message = "PROBLEME SERVEUR MAIL";
    throw err;
  }
})
}
);
  return Promise.resolve();
});

  /**
   * Permet de verifier un numero
   * @param {verifCode} request Le code de verification et le numero de telephone
   * @param {Function(Error, boolean)} callback
   */

  Etudiant.verifierCode = function(request) {
    return Etudiant.findOne({
      where: { email: request.email }
    })
      .then(user => {
      if (!user) {
      const error = new Error();
      error.statusCode = 404;
      error.code = "USER_NOT_FOUND";
      error.message = "Utilisateur n'existe pas";
      throw error;
    }
    const next = Promise.promisify(user.codeVerif, {
      context: user
    });
    return next().then(code => [code, user]);
  })
  .then(([code, user]) => {
      if (code && code.code === request.code) {
      return user.updateAttribute("emailVerified", true).then(() => {
        return code.remove().then(() => true);
    });
    } else {
      return false;
    }
  });
  };
  /**
   * Envoyer un mail avec un code pour recuperer un mot de passe
   * @param {recoverPass} request L'adresse mail du Etudiant
   * @param {Function(Error, boolean)} callback
   */

  Etudiant.recoverPassword = function(request) {
    return Etudiant.findOne({
      where: { email: request.email }
    }).then(user => {
      if (!user) {
      const err = new Error();
      err.statusCode = 404;
      err.code = "USER_NOT_FOUND";
      err.message = "COMPTE INTROUVABLE";
      throw err;
    }
    const tem = new Chance();
    const verifCode = tem.hash({ length: 6 });
    return user.codeVerif
      .create({ code: verifCode, date: new Date() })
      .then(() => {
      const mailOptions = {
        from: "SunuCodifs <contact@sunucodifs.com>",
        to: request.email,
        subject: "Récupération de Mot de Passe",
        text: `Votre Code de Recupération est ${verifCode}`
      };
    return transporter
      .sendMail(mailOptions)
      .then(info => {
      if (!info) {
      const err = new Error();
      err.statusCode = 500;
      err.code = "EMAIL_NOT_SENT";
      err.message = "PROBLEME SERVEUR MAIL";
      throw err;
    }
  })
  .then(() => true);
  });
  });
  };

  /**
   * Reinitialise le mot de passe
   * @param {resetPass} request Le code le mail et le nouveau mot de passe
   * @param {Function(Error, boolean)} callback
   */

  Etudiant.resetPassword = function(request) {
    return Etudiant.findOne({
      where: { email: request.email }
    })
      .then(user => {
      if (!user) {
      const err = new Error();
      err.statusCode = 404;
      err.code = "USER_NOT_FOUND";
      err.message = "COMPTE INTROUVABLE";
      throw err;
    }
    const next = Promise.promisify(user.codeVerif, {
      context: user
    });
    return next().then(code => [code, user]);
  })
  .then(([code, user]) => {
      if (code && code.code === request.code) {
      return user
        .updateAttribute("password", request.nouveaumdp)
        .then(() => {
        return code.remove().then(() => true);
    });
    } else {
      return false;
    }
  });
  };

};
