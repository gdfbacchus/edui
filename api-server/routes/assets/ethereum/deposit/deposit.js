
var dbScripts = require('../db-scripts/transaction');
var constants = require('../constants/eth-constants');
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
  logMessage = formatLogMsg('INFO', null, "ETH Deposit Parsed request body", req_json, null, logContext);
  logger.log('info', logMessage);

  // 1 STEP
  var current_timestamp = getCurrentUTCtime();
  var hashId = req_json.hash ? req_json.hash : "";
  var easydexConfirmed = req_json["easydex-confirm"];
  var cumulativeGasUsed = null;
  var gasUsed = null;
  var ethTxStatus = null;

  if(!easydexConfirmed) {
    errMsg = "ETH Deposit CONFIRM STATUS WAS NOT RECEIVED! easydex-confirm = ["+easydexConfirmed+"]";
    logMessage = formatLogMsg('ERROR', req.body, errMsg, null, null, logContext);
    logger.log('error',logMessage);
    res.status(500);
    res.send(JSON.stringify({"status": 500, "error": "CONFIRMATION STATUS FAILED", "response":""}));
    return;
  }
  var parsedMEMO = "";
  if(easydexConfirmed == "true" && hashId===""){

    try {
      parsedMEMO = JSON.parse(req_json.trx_id);
      cumulativeGasUsed = parsedMEMO.cumulativeGasUsed;
      gasUsed = parsedMEMO.gasUsed;
      ethTxStatus = parsedMEMO.status;
      hashId = parsedMEMO.hash;
    } catch (err) {
      errMsg = "ETH Transaction MEMO cannot be parsed!";
      logMessage = formatLogMsg('ERROR', req.body, errMsg, "", null, logContext);
      logger.log('error', logMessage);
      res.status(500);
      res.send(JSON.stringify({"status": 500, "error": errMsg, "response": ""}));
      return;
    }
  }
  logger.log('info', "ETH DEPOSIT parsedMEMO >>>>>>>>>>>>> " + (parsedMEMO ? JSON.stringify(parsedMEMO): null ));
  logger.log('info', "hash ID >>>>>>>>>>>>> " + hashId);
  dbScripts.getDepositTransactionRecord(res, hashId).then(function(result){
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

        //UPDATE transaction
        dbScripts.updateDepositTxStatus(res, hashId, current_timestamp, status)
          .then(function (updated) {
            if (updated) {
              var msg = "ETH Deposit Transaction was updated successfully status:[" + status + "]";
              logMessage = formatLogMsg('INFO', req.body, msg, null, null, logContext);
              logger.log('info', logMessage);
              res.status(200);
              res.send(JSON.stringify({"status": 200, "error": "", "response": msg}));
              return;
            } else {
              errMsg = "ETH Transaction wasn't updated, response of updateDepositTxStatus method is empty!";
              logMessage = formatLogMsg('ERROR', req.body, errMsg, updated, null, logContext);
              logger.log('error', logMessage);
              res.status(500);
              res.send(JSON.stringify({"status": 500, "error": errMsg, "response": ""}));
              return;
            }
          })
          .catch(function (err) {
            errMsg = "ETH Deposit Transaction wasn't updated, DB method updateDepositTxStatus failed!";
            logMessage = formatLogMsg('ERROR', req.body, errMsg, null, err, logContext);
            logger.log('error', logMessage);
            res.status(500);
            res.send(JSON.stringify({"status": 500, "error": errMsg, "response": ""}));
            return;
          });
      }
      else {
        errMsg = "ETH Deposit Transaction cannot be updated, easydexConfirmed=["+easydexConfirmed+"] !";
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
        var msg = "ETH Deposit Transaction was not inserted status:[" + status + "], it MUST be [pending]";
        logger.log('info', msg);
        res.status(500);
        res.send(JSON.stringify({"status": 500, "error": "", "response": msg}));
        return;
      }

      var amount = null;
      var asset = null;
      var value = parseInt(req_json.value);


      amount = value/constants.UNITS.ONE_ETH;
      amount = getNormalizedAmountValue(amount);
      //VALIDATE MIN AMOUNT MUST BE:  >= 0.01000000
      var isValidAmount = amount >= constants.AMOUNT.DEPOSIT_MIN;

      logger.log('info', "Normalized Amount : "+amount);
      logger.log('info', "Is Valid Amount: "+isValidAmount);

      if(!isValidAmount) {
        status= "donation"
      }

      //HAVE TO INSERT THE NEW ONE
      var dataToInsert = {
        value: value,
        gas_price: req_json.gasPrice,
        gas: req_json.gas,
        send_from: req_json.from,
        send_to: req_json.to,
        date_received: current_timestamp,
        status: status,
        hash_id: hashId,
        cumulative_gas_used: cumulativeGasUsed,
        gas_used: gasUsed,
        eth_tx_status: ethTxStatus
      };

      logMessage = formatLogMsg('INFO', req.body, "Deposit data to insert", dataToInsert, null, logContext);
      logger.log('info', logMessage);

      dbScripts.insertDepositTransaction(res, dataToInsert)
        .then(function(result){
          if(result) {
            var msg ="ETH Deposit Transaction was inserted successfully!";
            logMessage = formatLogMsg('INFO', null, msg, null, null, logContext);
            logger.log('info', logMessage);
            res.status(200);
            res.send(JSON.stringify({"status": 200, "error": "", "response":msg}));
            return;
          }
          else {
            errMsg = "ETH Deposit Transaction wasn't inserted, response of insertDepositTransaction method is empty!";
            logMessage = formatLogMsg('ERROR', req.body, errMsg, result, null, logContext);
            logger.log('error',logMessage);
            res.status(500);
            res.send(JSON.stringify({"status": 500, "error": errMsg, "response":""}));
            return;
          }
      })
        .catch(function(err){
          errMsg = "ETH Deposit Transaction wasn't inserted!";
          logMessage = formatLogMsg('ERROR', req.body, errMsg, null, err, logContext);
          logger.log('error',logMessage);
          res.status(500);
          res.send(JSON.stringify({"status": 500, "error": errMsg, "response":""}));
          return;
        });
    }
  }).catch(function(err){
    errMsg = "ETH Deposit Transaction DB getDepositTransactionRecord method failed!"
    logMessage = formatLogMsg('ERROR', req.body, errMsg, null, err, logContext);
    logger.log('error',logMessage);
    res.status(500);
    res.send(JSON.stringify({"status": 500, "error": "", "response":""}));
    return;
  });
};

function getNormalizedAmountValue(value){
  var strValue = value.toString();
  var nValue = null;

  if(value && strValue.indexOf('.') >= 0) {
    var arrStr = strValue.split('.');
    if(arrStr[1].length>8) {
      var subStr = arrStr[1].substr(0,8);
      nValue = parseFloat(arrStr[0] + "." + subStr);
    } else {
      nValue = value;
    }

  } else if(value && strValue) {
    nValue = value;
  }
  return nValue;
}

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