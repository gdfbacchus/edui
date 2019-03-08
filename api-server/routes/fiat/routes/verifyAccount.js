var dbScripts = require('../../common/db-scripts/fiat');
var constants_common = require('../../common/constants');
var logger = require('../../../logger/logger').logger;
var formatLogMsg = require('../../common/utils/loggerHelper').formatLogMsg;
var getCurrentUTCtime = require('../../../api-helpers/dateHelper').getCurrentUTCtime;
var logContext = constants_common.LOG_ACTION_CONTEXT.GET_FIAT_VERIFIED_ACCOUNT_CURRENCIES;
var logMessage = "";
var errMsg = "";

var verifyAccount = function(req, res) {



  dbScripts.getAvailableVerifiedCurrenciesByAccount(req, res)
    .then( function(resp) {
      var parsedResult = JSON.parse(JSON.stringify(resp));
      if(parsedResult.length > 0) {
        var msg ="Get Fiat Verified Account Currencies. There are some records!";
        logMessage = formatLogMsg('INFO', null, msg, parsedResult, null, logContext);
        logger.log('info', logMessage);
        res.status(200);
        res.send(JSON.stringify({ "result": JSON.stringify(parsedResult) }));
        return;
      } else {
        errMsg = "Get Fiat Verified Account Currencies. There are no records!";
        logMessage = formatLogMsg('ERROR', req.body, errMsg, resp, null, logContext);
        logger.log('error',logMessage);
        res.status(200);
        res.send(JSON.stringify({"response":""}));
        return;
      }

    })
    .catch(err => {
      errMsg = "Get Fiat Verified Account Currencies. DB getAvailableVerifiedCurrenciesByAccount() failed!"
      logMessage = formatLogMsg('ERROR', req.body, errMsg, null, err, logContext);
      logger.log('error',logMessage);
      res.status(500);
      res.send(JSON.stringify({"error": "Something went wrong!"}));
      return;
    });

};

module.exports.verifyAccount = verifyAccount;

