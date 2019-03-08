var dbScripts = require('../db-scripts/transaction');
var constants = require('../constants/steem-sbd-constants');
var constants_common = require('../../../common/constants');

var logger = require('../../../../logger/logger').logger;
var formatLogMsg = require('../../../common/utils/loggerHelper').formatLogMsg;
var logContext = constants_common.LOG_ACTION_CONTEXT.WITHDRAW;
var logMessage = "";
var errMsg = "";

var updateWithdrawData = (req, res, next) => {

  var req_json = req.body;
  // 1 STEP - parse request body
  // try {
  //   req_json = JSON.parse(JSON.stringify(req.body));
  //   logMessage = formatLogMsg('INFO', req.body, "STEEM/SBD Parsed request body UPDATE WITHDRAW", req_json, null, logContext);
  //   logger.log('info', logMessage);
  // }
  // catch (err) {
  //   errMsg = "STEEM/SBD Given request cannot be parsed"
  //   logMessage = formatLogMsg('ERROR', req.body, errMsg, null, err, logContext);
  //   logger.log('error',logMessage);
  //   res.status(500);
  //   res.send(JSON.stringify({"status": 500, "error": err, "response":errMsg}));
  //   return;
  // }

  // 1 STEP
  var receivedCode = req_json.easydex_code;
  var easydexConfirmed = req_json["easydex-confirm"];
  // logMessage = formatLogMsg('INFO', null, "STEEM/SBD Received code", receivedCode, null, logContext);
  logger.log('info', "req.body: "+JSON.stringify(req.body));
  logger.log('info', "receivedCode: "+receivedCode);
  logger.log('info', "easydex-confirm: "+easydexConfirmed);
  logger.log('info', "output_txid: "+(req_json.trx_id ? req_json.trx_id : ""));

  if(!receivedCode || !easydexConfirmed) {
    errMsg = "STEEM/SBD Withdraw Transaction cannot to proceed!";
    logMessage = formatLogMsg('ERROR', req.body, errMsg, {receivedCode: receivedCode, easydexConfirmed: easydexConfirmed}, null, logContext);
    logger.log('info',logMessage);
    res.status(500);
    res.send(JSON.stringify({"status": 500, "error": "error", "response":""}));
    return;
  }

  dbScripts.getWithdrawTxRecordByCode(res, receivedCode).then(function(result){
    var parsedResult = JSON.parse(JSON.stringify(result));
    var status = "";
    var data = {
      bts_txid: null,
      output_txid: null,
      status: null,
      code: receivedCode
    };
    if (easydexConfirmed == "true") {
      status = "sent";
      data.output_txid = req_json.trx_id ? req_json.trx_id : null;
    } else if (easydexConfirmed == "false") {
      status = "pending";
      data.bts_txid = req_json.bts_txid ? req_json.bts_txid : null;
    }
    data.status = status;

    logMessage = formatLogMsg('INFO', null, "Incoming DATA for update", data, null, logContext);
    logger.log('info', logMessage);

    //IF THE RECORD EXISTS
    if(parsedResult && parsedResult.length > 0 && parsedResult.length === 1) {
        //IF STATUS IS TRUE, DO NOT UPDATE!!!
        if( (parsedResult[0].status === "sent" && status==="sent")
              || (parsedResult[0].status === "pending" && status==="pending") ) {
          errMsg = "STEEM/SBD Withdraw Transaction was SKIPPED";
          logMessage = formatLogMsg('INFO', req.body, errMsg, null, null, logContext);
          logger.log('info',logMessage);
          res.status(200);
          res.send(JSON.stringify({"status": 200, "error": "", "response":"skipped"}));
          return;
        } else if ( (parsedResult[0].status === "initial" && status==="pending")
                      // IN CASE OF SECOND UPDATE - uncomment the line below
                      // || (parsedResult[0].status === "pending" && status==="sent")
                  ) {
          //UPDATE transaction
          dbScripts.updateWithdrawTx(res, data)
            .then(function (updated) {
              if (updated) {
                var msg = "STEEM/SBD Withdraw Transaction was sent and updated successfully";
                logMessage = formatLogMsg('INFO', null, msg, null, null, logContext);
                logger.log('info', logMessage);
                res.status(200);
                res.send(JSON.stringify({"status": 200, "error": "", "response": msg}));
                return;
              }
            })
            .catch(function (err) {
              errMsg = "STEEM/SBD Withdraw Transaction wasn't updated"
              logMessage = formatLogMsg('ERROR', req.body, errMsg, null, err, logContext);
              logger.log('error', logMessage);
              res.status(500);
              res.send(JSON.stringify({"status": 500, "error": "", "response": ""}));
              return;
            });
        }
    }
    //IF THE RECORD NOT EXISTS
    else {
      errMsg = "STEEM/SBD Transaction record not exists"
      logMessage = formatLogMsg('ERROR', req.body, errMsg, null, null, logContext);
      logger.log('error',logMessage);
      res.status(500);
      res.send(JSON.stringify({"status": 500, "error": "", "response":""}));
      return;
    }
  }).catch(function(err){
    errMsg = "STEEM/SBD Withdraw Transaction DB getWithdrawTxRecordByCode method failed!"
    logMessage = formatLogMsg('ERROR', req.body, errMsg, null, err, logContext);
    logger.log('error',logMessage);
    res.status(500);
    res.send(JSON.stringify({"status": 500, "error": "", "response":""}));
    return;
  });
};






module.exports.updateWithdrawData = updateWithdrawData;

