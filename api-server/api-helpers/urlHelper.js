var constants = require('../constants/common');

var getUrlSegments = function(req){
  if(req.path) {
    var elements = req.path.split('/');
    return elements;
  }
  return null;

};

var isExistQueryParam = function(req, str){

  if(req.query && req.query[str]) {
    return true;
  }
  return false;
};

var assetExists = function (pathSegmentForCheck) {
  var availableAssets = constants.wallets;
  for(var asset in availableAssets) {
    if(asset===pathSegmentForCheck) {
      return availableAssets[asset];
    }
  }
  return false;
};


module.exports.getUrlSegments = getUrlSegments;
module.exports.isExistQueryParam = isExistQueryParam;
module.exports.assetExists = assetExists;
