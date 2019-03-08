var config = require('../../../../api-server.config').getBitcoinConfig();
var kapitalize = require('kapitalize')();

var makeClient = function () {
  kapitalize.auth(config.user, config.pass);
  kapitalize.set('host', config.host);
  kapitalize.set('port', config.port);
  return kapitalize;
};

module.exports.makeClient = makeClient;
