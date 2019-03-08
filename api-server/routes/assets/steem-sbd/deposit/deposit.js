
var dbScripts = require('../db-scripts/transaction');
var constants = require('../constants/steem-sbd-constants');
var constants_common = require('../../../common/constants');
var getCurrentUTCtime = require('../../../../api-helpers/dateHelper').getCurrentUTCtime;
var logger = require('../../../../logger/logger').logger;
var formatLogMsg = require('../../../common/utils/loggerHelper').formatLogMsg;
var logContext = constants_common.LOG_ACTION_CONTEXT.DEPOSIT;
var logMessage = "";
var errMsg = "";

var deposit = (req, res, next) => {
  var req_json = null;
  req_json = req.body;
  logMessage = formatLogMsg('INFO', null, "STEEM/SBD Deposit Parsed request body", req_json, null, logContext);
  logger.log('info', logMessage);

  /*
   // 1 STEP - parse request body
  try {
    req_json = JSON.parse(JSON.stringify(req.body));
    logMessage = formatLogMsg('INFO', null, "STEEM/SBD Deposit Parsed request body", req_json, null, logContext);
    logger.log('info', logMessage);
  }
  catch (err) {
    errMsg = "STEEM/SBD Deposit Given request cannot be parsed"
    logMessage = formatLogMsg('ERROR', req.body, errMsg, null, err, logContext);
    logger.log('error',logMessage);
    res.status(500);
    res.send(JSON.stringify({"status": 500, "error": err, errMsg}));
    return;
  }
  */
  // 1 STEP
  var txid = req_json.trx_id;
  var current_timestamp = getCurrentUTCtime();
  var easydexConfirmed = req_json["easydex-confirm"];

  if(!easydexConfirmed) {
    errMsg = "STEEM/SBD Deposit CONFIRM STATUS WAS NOT RECEIVED! easydex-confirm = ["+easydexConfirmed+"]";
    logMessage = formatLogMsg('ERROR', req.body, errMsg, null, null, logContext);
    logger.log('error',logMessage);
    res.status(500);
    res.send(JSON.stringify({"status": 500, "error": "CONFIRMATION STATUS FAILED", "response":""}));
    return;
  }

  logger.log('info','trx_id: '+txid);
  logger.log('info','_id: '+req_json._id);

  dbScripts.getDepositTransactionRecord(res, txid).then(function(result){
    var parsedResult = JSON.parse(JSON.stringify(result));

    var status = "";


    logger.log('info','easydexConfirmed: '+easydexConfirmed);
    if (easydexConfirmed == "true") {
      status = "sent";
    } else {
      status = "pending";
    }
    logger.log('info','status: '+status);
    //IF THE RECORD EXISTS
    if(parsedResult && parsedResult.length > 0 && parsedResult.length === 1) {

      if (easydexConfirmed == "true") {
        var signatures = req_json.signatures;
        if(!req_json.signatures) {
          errMsg = "STEEM/SBD Deposit Transaction cannot be updated, easydexConfirmed=["+easydexConfirmed+"] !";
          logMessage = formatLogMsg('ERROR', req.body, errMsg, req_json.amount, null, logContext);
          logger.log('error',logMessage);
          res.status(500);
          res.send(JSON.stringify({"status": 500, "error": "Error", "response":""}));
          return;
        }
        signatures = JSON.stringify(signatures);
        //UPDATE transaction
        dbScripts.updateDepositTxStatus(res, txid, current_timestamp, signatures, status)
          .then(function (updated) {
            if (updated) {
              var msg = "STEEM/SBD Deposit Transaction was updated successfully status:[" + status + "]";
              logMessage = formatLogMsg('INFO', req.body, msg, null, null, logContext);
              logger.log('info', logMessage);
              res.status(200);
              res.send(JSON.stringify({"status": 200, "error": "", "response": msg}));
              return;
            } else {
              errMsg = "STEEM/SBD Transaction wasn't updated, response of updateDepositTxStatus method is empty!";
              logMessage = formatLogMsg('ERROR', req.body, errMsg, updated, null, logContext);
              logger.log('error', logMessage);
              res.status(500);
              res.send(JSON.stringify({"status": 500, "error": errMsg, "response": ""}));
              return;
            }
          })
          .catch(function (err) {
            errMsg = "STEEM/SBD Deposit Transaction wasn't updated, DB method updateDepositTxStatus failed!";
            logMessage = formatLogMsg('ERROR', req.body, errMsg, null, err, logContext);
            logger.log('error', logMessage);
            res.status(500);
            res.send(JSON.stringify({"status": 500, "error": errMsg, "response": ""}));
            return;
          });
      }
      else {
        errMsg = "STEEM/SBD Deposit Transaction cannot be updated, easydexConfirmed=["+easydexConfirmed+"] !";
        logMessage = formatLogMsg('ERROR', req.body, errMsg, req_json.amount, null, logContext);
        logger.log('error',logMessage);
        res.status(500);
        res.send(JSON.stringify({"status": 500, "error": "Error", "response":""}));
        return;
      }
    }
    //IF THE RECORD NOT EXISTS
    else {
      if(status === "sent") {
        var msg = "STEEM/SBD Deposit Transaction was not inserted status:[" + status + "], it MUST be [pending]";
        logger.log('info', msg);
        res.status(500);
        res.send(JSON.stringify({"status": 500, "error": "", "response": msg}));
        return;
      }

      var aaObj = getAssetAndAmountFromStr(req_json.amount);
      var amount = null;
      var asset = null;
      if(aaObj) {
        amount = aaObj.amount;
        asset = aaObj.asset;
        logger.log('info', "Asset to deposit is: "+asset);
        logger.log('info', "Amount to deposit is: "+amount);
      }
      else {
        errMsg = "STEEM/SBD Deposit Transaction cannot parse amount and asset!";
        logMessage = formatLogMsg('ERROR', req.body, errMsg, req_json.amount, null, logContext);
        logger.log('error',logMessage);
        res.status(500);
        res.send(JSON.stringify({"status": 500, "error": "error", "response":""}));
        return;
      }

      amount = parseFloat(parseFloat(amount).toFixed(3));
      //VALIDATE MIN AMOUNT MUST BE:  >=1
      var isValidAmount = amount >= constants.AMOUNT.DEPOSIT_MIN;

      logger.log('info', "Amount parseFloat: "+amount);
      logger.log('info', "Is Valid Amount: "+isValidAmount);

      if(!isValidAmount) {
        status= "donation"
      }

      //HAVE TO INSERT THE NEW ONE
      var dataToInsert = {
        trx_id: txid,
        _id:req_json._id,
        send_from: req_json.from,
        send_to: req_json.to,
        amount: amount,
        asset: asset,
        memo: req_json.memo,
        steem_timestamp: req_json.timestamp,
        date_received: current_timestamp,
        status: status
      };

      logMessage = formatLogMsg('INFO', req.body, "Depsit data to insert", dataToInsert, null, logContext);
      logger.log('info', logMessage);

      dbScripts.insertDepositTransaction(res, dataToInsert)
        .then(function(result){
          if(result) {
            var msg ="STEEM/SBD Deposit Transaction was inserted successfully!";
            logMessage = formatLogMsg('INFO', null, msg, null, null, logContext);
            logger.log('info', logMessage);
            res.status(200);
            res.send(JSON.stringify({"status": 200, "error": "", "response":msg}));
            return;
          }
          else {
            errMsg = "STEEM/SBD Deposit Transaction wasn't inserted, response of insertDepositTransaction method is empty!";
            logMessage = formatLogMsg('ERROR', req.body, errMsg, result, null, logContext);
            logger.log('error',logMessage);
            res.status(500);
            res.send(JSON.stringify({"status": 500, "error": errMsg, "response":""}));
            return;
          }
      })
        .catch(function(err){
          errMsg = "STEEM/SBD Deposit Transaction wasn't inserted!";
          logMessage = formatLogMsg('ERROR', req.body, errMsg, null, err, logContext);
          logger.log('error',logMessage);
          res.status(500);
          res.send(JSON.stringify({"status": 500, "error": errMsg, "response":""}));
          return;
        });
    }
  }).catch(function(err){
    errMsg = "STEEM/SBD Deposit Transaction DB getDepositTransactionRecord method failed!"
    logMessage = formatLogMsg('ERROR', req.body, errMsg, null, err, logContext);
    logger.log('error',logMessage);
    res.status(500);
    res.send(JSON.stringify({"status": 500, "error": "", "response":""}));
    return;
  });
};

function getAssetAndAmountFromStr(str) {
  var arr = str.split(" ");
  return arr && arr.length===2 ? {amount: arr[0], asset: arr[1]} : null;
}

function getAssetFromStr(str) {
  var arr = str.split(" ");
  return arr && arr.length===2 ? arr[1] : null;
}

function getAmountFromStr(str) {
  var arr = str.split(" ");
  return arr && arr.length===2 ? arr[0] : null;
}

module.exports.deposit = deposit;