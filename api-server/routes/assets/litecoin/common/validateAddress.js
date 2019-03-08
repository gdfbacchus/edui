var config = require('../../../../api-server.config').getLitecoinConfig();
var litecoin = require('litecoin');

var validateAddress = function (req, res, asset, address) {
  var manager = new litecoin.Client(config);
  manager.validateAddress(address, function(err, addressResp) {
    if(err) {
      res.send(JSON.stringify({"status": 200, "error": err, "response":{isvalid: false}}));
    } else {
      console.log("Address validation result: ", addressResp);
      res.send(JSON.stringify({"status": 200, "error": null, "response": {isValid: addressResp.isvalid}  }));
    }
  });
};


module.exports.validateAddress = validateAddress;