var urlHelpers = require('../api-helpers/urlHelper');

var validateAddr = function(req, res) {
  var segments = urlHelpers.getUrlSegments(req);
  var error = false;

  if(segments.length===7){
    var asset = urlHelpers.assetExists(segments[5]);
    if(asset && asset.name) {
      //Require specific path depends on ASSET
      var assetValidationScript = require('./assets/'+asset.name+'/common/validateAddress');

      console.log("Address: ", req.query.address);
      console.log("Asset: ", asset);

      if(req.query && req.query.address) {
        assetValidationScript.validateAddress(req, res, asset, decodeURI(req.query.address));
      } else {error=true}
    } else {error=true}
  } else {error=true}

  if(error) {
    res.send(JSON.stringify({"status": 400, "error": "Bad Request", "response":""}));
  }
};



module.exports.validateAddr = validateAddr;