

var dbScripts = require('../common/db-scripts/transactions');
var constants_common = require('../common/constants');
var logger = require('../../logger/logger').logger;
var formatLogMsg = require('../common/utils/loggerHelper').formatLogMsg;
var logContext = constants_common.LOG_ACTION_CONTEXT.GET_LAST_TX_ID;
var logMessage = "";
var errMsg = "";

var getLatestTxIds = (req, res, next) => {

  logger.log('info', "Get last tx id request body: "+JSON.stringify(req.body));

  var operation = req.body.op;
  var asset = req.body.asset;
  var username = req.body.account;
  var walletType = req.body.walletType;


  if(!operation || !asset || !username || !walletType) {
    errMsg = "Get last tx id failed! Wrong parameters given.";
    logMessage = formatLogMsg('ERROR', req.body, errMsg, null, null, logContext);
    logger.log('info',logMessage);
    res.status(200);
    res.send(JSON.stringify({"status": 200, "error": "error", "response":""}));
    return;
  }
  // res.status(200);
  // res.send(JSON.stringify({"status": 200, "error": "error", "response":req.body}));

  dbScripts.getLatestTxIds(res, operation, asset, username, walletType)
    .then(function(result) {
      var parsedResult = JSON.parse(JSON.stringify(result));

      if(parsedResult.length && parsedResult.length > 0) {
        var msg ="Get recent tx ids. Was found results.";
        logger.log('info', msg);
        res.status(200);
        res.send(JSON.stringify({"status": 200, "error": "", "response":parsedResult}));
        return;
      } else {
        var msg ="Get recent tx ids. Was not found results.";
        logger.log('info', msg);
        res.status(200);
        res.send(JSON.stringify({"status": 200, "error": "", "response":[]}));
        return;
      }


    })
    .catch(function(err){
      errMsg = "Get recent tx ids. DB Method getLatestTxIds() failed!";
      logMessage = formatLogMsg('ERROR', req.body, errMsg, null, err, logContext);
      logger.log('error',logMessage);
      res.status(500);
      res.send(JSON.stringify({"status": 500, "error": "error", "response":""}));
      return;
    });

}


module.exports.getLatestTxIds = getLatestTxIds;
