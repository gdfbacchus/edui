var floatEqual = require('float-equal');

var dbScripts = require('../db-scripts/transaction');
var constants = require('../constants/btc-constants');
var constants_common = require('../../../common/constants');
var btcClient = require('../core/btcClient');
var logger = require('../../../../logger/logger').logger;
var formatLogMsg = require('../../../common/utils/loggerHelper').formatLogMsg;

var logContext = constants_common.LOG_ACTION_CONTEXT.WITHDRAW;
var logMessage = "";

var processReceivedBtsTx = function (req, res, next) {
  var json = null;
  // 1 STEP - parse request body
  try {
    json = JSON.parse(JSON.stringify(req.body));
    logMessage = formatLogMsg('INFO', req.body, "Parsed request body", json, null, logContext);
    logger.log('info', logMessage);
  }
  catch (err) {
    logMessage = formatLogMsg('ERROR', req.body, "Given request cannot be parsed!", null, err, logContext);
    logger.log('error',logMessage);

    res.status(500);
    res.send(JSON.stringify({"status": 500, "error": err, "response":""}));
    return;
  }

  // 2 STEP Get DB row with the exact easydex code
  dbScripts.getInitialWithdrawData(res, json)
    .then( function(resp) {
      var resJSONData = null;
      try{
        resJSONData = JSON.parse(JSON.stringify(resp));
        logMessage = formatLogMsg('INFO', null, "dbScripts.getInitialWithdrawData() response", resJSONData, null, logContext);
        logger.log('info', logMessage);

      } catch (err){
        logMessage = formatLogMsg('ERROR', req.body, "Result data from dbScripts.getInitialWithdrawData() method, cannot be parsed.", resp, err, logContext);
        logger.log('error', logMessage);
        res.status(500);
        res.send(JSON.stringify({"status": 500, "error": "error", "response":""}));
        return;
      }

      if(resJSONData && resJSONData.length === 1){
        var resultObj = resJSONData[0];
        //2.1 STEP UPDATE WITHDRAW STATUS
        dbScripts.updateWithdrawStatus(res, resultObj.easydex_code, "pending")
          .then(function(updateResponse){
            console.log("Transaction was updated with [pending] status.");
            //res.send(JSON.stringify( { "status": 200, "error": null, "response": "Transaction was updated with [pending] status." } ) );
          })
          .catch(function(err){

            var errMsg = "DB updateWithdrawStatus() failed. Transaction was NOT updated with [pending] status.";


            logMessage = formatLogMsg('ERROR', req.body, errMsg, null, err, logContext);
            logger.log('error', logMessage);
            res.send(JSON.stringify({"status": 500, "error": "error", "response":""}));
            return;
          });

        // 3 STEP - verify and validate DATA
        var asset = resultObj.asset;
        var addrSendTo = resultObj.asset_address;

        var amount = parseFloat(parseFloat(json.amount).toFixed(8));
        var minerFee = parseFloat(parseFloat(json.minerFee).toFixed(8));
        var dbAmount = parseFloat(parseFloat(resultObj.amount).toFixed(8));
        var dbMinerFee = parseFloat(parseFloat(resultObj.minerFee).toFixed(8));
        var total = calcTotal(amount, minerFee);
        var totalDbAmount = calcTotal(dbAmount, dbMinerFee);

        var isEqualFee = isValidFloatPair(minerFee, dbMinerFee);
        var isEqualAmount = isValidFloatPair(amount, dbAmount);
        var isEqualTotatlAmount = floatEqual(total, totalDbAmount);
        var isEqualAsset = asset === json.asset;

        var hasAddressSendTo = !!addrSendTo;

        var isValidFee = minerFee >= constants.FEES.MIN_TX_FEE;
        var isValidAmount = amount >= constants.FEES.MIN_TO_WITHDRAW;

        var validationData = {
          dataFromDecodedMemo: json,
          dataFromDB: resJSONData[0],
          isEqualFee: isEqualFee,
          isEqualAmount: isEqualAmount,
          isEqualTotatlAmount: isEqualTotatlAmount,
          isEqualAsset: isEqualAsset,
          isValidFee: isValidFee,
          isValidAmount: isValidAmount,
          hasAddressSendTo: hasAddressSendTo
        };

        logMessage = formatLogMsg('INFO', null, "Validation data", validationData, null, logContext);
        logger.log('info', logMessage);

        if(isValidAmount &&
          isEqualFee &&
            isValidFee &&
              isEqualAmount &&
                isEqualAsset &&
                  isEqualTotatlAmount &&
                    hasAddressSendTo ) {

          logMessage = formatLogMsg('INFO', null, "Validation is passed.", null, null, logContext);
          logger.log('info', logMessage);

          minerFee = minerFee.toFixed(8);
          amount = amount.toFixed(8);

          logMessage = formatLogMsg('INFO', null, "Miner fee and amount to send", {minerFee: minerFee, amount:amount }, null, logContext);
          logger.log('info', logMessage);

          var manager = btcClient.makeClient();
          // 4 STEP - set BTC transaction fee
          manager.setTxFee(minerFee, function(err, result) {
            if (err) {
              logMessage = formatLogMsg('ERROR', req.body, "BTC setTxFee() failed.", null, err, logContext);
              logger.log('error', logMessage);
              res.status(500);
              res.send(JSON.stringify({"status": 500, "error": "error", "response":""}));
              return;
            }

            if(JSON.parse(result)===true) {
              logMessage = formatLogMsg('INFO', null, "setTxFee() result", result, null, logContext);
              logger.log('info', logMessage);

              // 5 STEP - Send to address
              manager.sendToAddress( addrSendTo, amount, function(err, txid){
                if (err) {
                  logMessage = formatLogMsg('ERROR', req.body, "BTC sendToAddress() failed.", null, err, logContext);
                  logger.log('error', logMessage);
                  res.status(500);
                  res.send(JSON.stringify({"status": 500, "error": "error", "response":""}));
                  return;
                }

                logMessage = formatLogMsg('INFO', null, "sendToAddress() result->txid", txid, null, logContext);
                logger.log('info', logMessage);

                // 6 STEP - Update DB with the rest of data
                dbScripts.updateWithdrawData(res, resultObj.easydex_code, "empty", txid, "sent")
                  .then(function(addrResponse){
                    logMessage = formatLogMsg('INFO', null, "WITHDRAW DB DATA WAS SUCCESSFUL UPDATED :)", null, null, logContext);
                    logger.log('info', logMessage);
                    logger.log('info', "Transaction was sent successfully.");
                    res.send(JSON.stringify( { "status": 200, "error": null, "response": "Transaction was sent successfully." } ) );
                    return;
                  })
                  .catch(function(err){
                    var errMsg = "DB updateWithdrawData() fails.";
                    logMessage = formatLogMsg('ERROR', req.body, errMsg, null, err, logContext);
                    logger.log('error', logMessage);
                    res.status(500);
                    res.send(JSON.stringify({"status": 500, "error": "error", "response":""}));
                    return;
                  });
              });
            }
          });
        } else {
          logMessage = formatLogMsg('ERROR', req.body, "Validation of received bts json-data is not passed.", validationData, null, logContext);
          logger.log('error', logMessage);
          res.status(500);
          res.send(JSON.stringify({"status": 500, "error": "error", "response":""}));
          return;
        }
      }
      else {
        // Not found DB result
        logMessage = formatLogMsg('ERROR', req.body, "dbScripts.getInitialWithdrawData() method Not found corresponding DB record for the request.", null, null, logContext);
        logger.log('error', logMessage);
        res.status(500);
        res.send(JSON.stringify({"status": 500, "error": "error", "response":""}));
        return;
      }
    })
    .catch(err => {
      console.log("ERROR: ", err);
      var errMsg = "DB getInitialWithdrawData() fails!";

      logMessage = formatLogMsg('ERROR', req.body, errMsg, null, err, logContext);
      logger.log('error', logMessage);
      res.status(500);
      res.send(JSON.stringify({"status": 500, "error": "error", "response":""}));
      return;
    });

};
function isValidFloatPair( val1, val2){
  if(!isFloat(val1) || !isFloat(val2)){
    return false;
  }
  return val1===val2;
}

function calcTotal(amount, fee) {
  return parseFloat(parseFloat(amount + fee).toFixed(8));
}

function isInt(n){
  return Number(n) === n && n % 1 === 0;
}

function isFloat(n){
  return Number(n) === n && n % 1 !== 0;
}

function convertSatsToBTC(sats){
  var res = null;
  var int = parseInt(sats);
  if(int) {
    res = int / constants.ASSETS.EASYDEX.BTC.ONE_BITCOIN_SATS;
  }
  return res;
}

module.exports.processReceivedBtsTx = processReceivedBtsTx ;