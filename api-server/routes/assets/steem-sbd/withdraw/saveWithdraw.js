
var dbScripts = require('../db-scripts/transaction');
var constants_common = require('../../../common/constants');
var getCurrentUTCtime = require('../../../../api-helpers/dateHelper').getCurrentUTCtime;
var logger = require('../../../../logger/logger').logger;
var formatLogMsg = require('../../../common/utils/loggerHelper').formatLogMsg;
var logContext = constants_common.LOG_ACTION_CONTEXT.WITHDRAW;
var logMessage = "";
var errMsg = "";


var saveWithdraw = function (req, res, next) {
  logMessage = formatLogMsg('INFO', req.body, "STEEM/SBD Save Wi Parsed request body", null, null, logContext);
  logger.log('info', logMessage);

  var easydexCode = makeEasydexCode(38);
  var startTime = getCurrentUTCtime();

  logger.log('info','START DATE TO SAVE WITHDRAW: '+startTime);
  logger.log('info','Generated easydexCode: '+easydexCode);

  dbScripts.insertInitWithdrawData(req, res, easydexCode, startTime)
    .then( function(resp) {
      var response = {
        easydexCode: easydexCode
      };

      if(resp) {
        var msg ="STEEM/SBD Withdraw Transaction was saved(inserted) successfully";
        logMessage = formatLogMsg('INFO', null, msg, response, null, logContext);
        logger.log('info', logMessage);
        res.status(200);
        res.send(JSON.stringify({"status": 200, "error": null, "response": JSON.stringify(response)}));
        return;
      } else {
        errMsg = "STEEM/SBD Withdraw Transaction wasn't saved, response of insertInitWithdrawData method is empty!";
        logMessage = formatLogMsg('ERROR', req.body, errMsg, resp, null, logContext);
        logger.log('error',logMessage);
        res.status(500);
        res.send(JSON.stringify({"status": 500, "error": "", "response":""}));
        return;
      }

    })
    .catch(err => {
      errMsg = "STEEM/SBD withdraw DB insertInitWithdrawData() failed!"
      logMessage = formatLogMsg('ERROR', req.body, errMsg, null, err, logContext);
      logger.log('error',logMessage);
      res.status(500);
      res.send(JSON.stringify({"status": 500, "error": "", "response":""}));
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

module.exports.saveWithdraw = saveWithdraw ;