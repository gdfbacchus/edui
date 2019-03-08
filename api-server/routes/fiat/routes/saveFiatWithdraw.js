
var constants = require('../../common/constants');
var dbScripts = require('../../common/db-scripts/fiat');
var constants_common = require('../../common/constants');
var getCurrentUTCtime = require('../../../api-helpers/dateHelper').getCurrentUTCtime;
var logger = require('../../../logger/logger').logger;
var formatLogMsg = require('../../common/utils/loggerHelper').formatLogMsg;

var logContext = constants_common.LOG_ACTION_CONTEXT.WITHDRAW;
var logMessage = "";


var saveFiatWithdraw = function (req, res, next) {

  if(!req.body.from_account || !req.body.to_account || !req.body.amount || !req.body.asset || !req.body.fee_asset_id
      || !req.body.fee_asset_amount_sats || !req.body.trx_id || !req.body.trx_block_num ){

    var errMsg = "Fiat DB saveFiatWithdraw() failed! Missed data in request!";
    logMessage = formatLogMsg('ERROR', req.body, errMsg, null, null, logContext);
    logger.log('error', logMessage);
    res.status(500);
    res.send(JSON.stringify({"response":"error"}));
    return;
  }

  dbScripts.getExistingWithdrawData(req, res)
    .then( function(resp) {
      var parsedResult = JSON.parse(JSON.stringify(resp));

      if(parsedResult && parsedResult.length > 0) {
        var msg ="FIAT WITHDRAW DATA ALREADY EXISTS!";
        logMessage = formatLogMsg('ERROR', req.body, msg, parsedResult, null, logContext);
        logger.log('ERROR', logMessage);
        res.status(500);
        res.send(JSON.stringify({ "result": "error" }));
        return;
      }
      else {
        logMessage = formatLogMsg('INFO', req.body, "Start to save Fiat Withdraw data", null, null, logContext);
        logger.log('info', logMessage);

        var withdrawDate = getCurrentUTCtime();

        dbScripts.insertFiatWithdrawData(req, res, withdrawDate)
          .then( function(resp) {
            logMessage = formatLogMsg('INFO', null, "Fiat Withdraw data was saved successfully", null, null, logContext);
            logger.log('info', logMessage);
            res.status(500);
            res.send(JSON.stringify({"response": "success"}));
            return;
          })
          .catch(err => {
            var errMsg = "Fiat DB insertFiatWithdrawData() failed!";
            logMessage = formatLogMsg('ERROR', req.body, errMsg, null, err, logContext);
            logger.log('error', logMessage);
            res.status(500);
            res.send(JSON.stringify({"status": 500, "error": "error", "response":""}));
            return;
          });
      }

    })
    .catch(function(err) {
      var errMsg = "Fiat DB getExistingWithdrawData() failed!";
      logMessage = formatLogMsg('ERROR', req.body, errMsg, null, err, logContext);
      logger.log('info', logMessage);
      res.status(500);
      res.send(JSON.stringify({"response":"error"}));
      return;
    });
};

function convertSatsToBTC(sats){
  var res = null;
  var int = parseInt(sats);
  if(int) {
    res = int / constants.ASSETS.EASYDEX.LTC.ONE_LITECOIN_SATS;
  }
  return res;
}

module.exports.saveFiatWithdraw = saveFiatWithdraw;