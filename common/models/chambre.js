'use strict';

module.exports = function(Chambre) {
  Chambre.beforeRemote("create", ctx => {
    const user = ctx.args.data;
    user.nbposres = user.nbpositions ;
    return Promise.resolve();
  });
};
