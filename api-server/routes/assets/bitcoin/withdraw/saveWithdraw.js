var constants = require('../../../common/constants');
var dbScripts = require('../db-scripts/transaction');
var constants_common = require('../../../common/constants');
var getCurrentUTCtime = require('../../../../api-helpers/dateHelper').getCurrentUTCtime;

var logger = require('../../../../logger/logger').logger;
var formatLogMsg = require('../../../common/utils/loggerHelper').formatLogMsg;
var logContext = constants_common.LOG_ACTION_CONTEXT.WITHDRAW;
var logMessage = "";

var saveWithdraw = function (req, res, next) {

  logMessage = formatLogMsg('INFO', req.body, "Start to save Withdraw data", null, null, logContext);
  logger.log('info', logMessage);

  var calcAmount = req.body.amount;
  var easydexCode = makeEasydexCode(37);
  var startTime = getCurrentUTCtime();

  logMessage = formatLogMsg('INFO', null, "Generated easydexCode", {easydexCode: easydexCode}, null, logContext);
  logger.log('info', logMessage);

  dbScripts.insertInitWithdrawData(req, res, calcAmount, easydexCode, startTime)
    .then( function(resp) {
      var response = {
        easydexCode: easydexCode
      };
      logMessage = formatLogMsg('INFO', null, "Withdraw data was saved successfully", null, null, logContext);
      logger.log('info', logMessage);
      res.send(JSON.stringify({"status": 200, "error": null, "response": JSON.stringify(response)}))
    })
    .catch(err => {
      var errMsg = "DB insertInitWithdrawData() failed!";
      logMessage = formatLogMsg('ERROR', req.body, errMsg, null, err, logContext);
      logger.log('error', logMessage);
      res.status(500);
      res.send(JSON.stringify({"status": 500, "error": "error", "response":""}));
      return;
    });


};


function makeEasydexCode(len) {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < len; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return "easydex-w-code_"+text;
}

function convertSatsToBTC(sats){
  var res = null;
  var int = parseInt(sats);
  if(int) {
    res = int / constants.ASSETS.EASYDEX.BTC.ONE_BITCOIN_SATS;
  }
  return res;
}

module.exports.saveWithdraw = saveWithdraw ;