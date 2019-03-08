
var dbScripts = require('./common/db-scripts/assets');
var constants_common = require('./common/constants');

var logger = require('../logger/logger').logger;
var formatLogMsg = require('./common/utils/loggerHelper').formatLogMsg;
var logContext = constants_common.LOG_ACTION_CONTEXT.ASSET_SETTINGS;
var logMessage = "";
var errMsg = "";

var getAssetSettings = function(req, res) {

    dbScripts.getAvailableAssets(res)
      .then(function(result){
        var resJSONData = null;

        if(result) {
          try {
            resJSONData = JSON.parse(JSON.stringify(result));

            var msg = "Asset Settings, successful get and parse assets data!";
            logMessage = formatLogMsg('INFO', null, msg, resJSONData, null, logContext);
            logger.log('info', logMessage);
            res.status(200);
            res.send(JSON.stringify({"status": 200, "error": "", "response":JSON.stringify(resJSONData,null,2)}));
          }
          catch (err) {
            errMsg = "Asset Settings data cannot be parsed";
            logMessage = formatLogMsg('ERROR', null, errMsg, null, err, logContext);
            logger.log('error', logMessage);
            res.status(500);
            res.send(JSON.stringify({"status": 500, "error": err, errMsg}));
            return;
          }
        }
        else {
          errMsg = "Asset Settings, result of getAssetSettings method is empty!";
          logMessage = formatLogMsg('ERROR', null, errMsg, result, null, logContext);
          logger.log('error',logMessage);
          res.status(500);
          res.send(JSON.stringify({"status": 500, "error": errMsg, "response":""}));
          return;
        }
    }).catch(function(err){
      errMsg = "Get Asset Settings, DB getAssetSettings method failed!"
      logMessage = formatLogMsg('ERROR', null, errMsg, null, err, logContext);
      logger.log('error',logMessage);
      res.status(500);
      res.send(JSON.stringify({"status": 500, "error": errMsg, "response":""}));
      return;
    });
};

module.exports.getAssetSettings = getAssetSettings;