//OLD-CURRENT
// var dbScripts = require('../db-scripts/transaction');
// var constants = require('../constants/ltc-constants');
// var mainConstants = require('../../../common/constants');
// var config = require('../../../../api-server.config').getLitecoinConfig();
// var litecoin = require('litecoin');
// var getCurrentUTCtime = require('../../../../api-helpers/dateHelper').getCurrentUTCtime;
// var zerorpc = require("zerorpc");
//
//
// var CONST = constants.WALLETNOTIFY;
// var counter = 1;
// var walletnotify = (req, res, next) => {
//   var txId = req.query.tx;
//   console.log("Wallet notification is received, txId: ", txId);
//   var manager = new litecoin.Client(config);
//   //console.log("counter: ",counter);counter++;
//   //TEST with mock data
//   //var txData = (process.env.TEST_API).trim()==='mock' ? JSON.parse(JSON.stringify(mockTxInfo)) : manager.getTransaction(txId);
//
//   // 1 STEP
//   manager.getTransaction(txId, function(err, data) {
//     if (err) {
//       throw err;
//     }
//     var txData = JSON.parse(JSON.stringify(data));
//     txData = txData.result || txData;
//     //console.log("data1: ",data);
//     //console.log("data2: ",data.result);
//     var receivedConfirmations = txData.confirmations;
//     console.log("txData: ",txData);
//     console.log("receivedConfirmations: ",receivedConfirmations);
//
//     //TODO  Check if amount is greater than or equal to minimum
//     var isValidAmount = txData.amount >= mainConstants.ASSETS.EASYDEX.BTC.MIN_DEPOSIT_AMOUNT ;
//     console.log("Amount: ",txData.amount); console.log("minimum amount for deposit: ",mainConstants.ASSETS.EASYDEX.BTC.MIN_DEPOSIT_AMOUNT);
//     console.log("Amount is valid: ", isValidAmount);
//
//     //SKIP NOTIFICATION
//     if(receivedConfirmations === 0) {
//       console.log("skipp notification (conf=" + receivedConfirmations + ")");
//       res.send(JSON.stringify({"status": 500, "error": "Skip notification 0 confirmations", "response":""}));
//       return;
//     }
//     // 2 STEP
//     else if(receivedConfirmations && receivedConfirmations >= 1) {
//       //SKIP TRANSACTION WHEN AMOUNT LESS THAN MINIMUM
//       if(!isValidAmount) {
//         console.log("Amount is not valid : ");
//         console.log("Transaction will be skipped!");
//         res.send(JSON.stringify({"status": 500, "error": errMsg, "response":"Amount is not valid, less than minimum!"}));
//         return;
//       }
//
//       //console.log("txData: ",txData);
//       var currentUtcTime = getCurrentUTCtime();
//       var details = findProperDetailsObj(txData.details);
//       console.log("details: ",details);
//
//       if(details) {
//         // 3 STEP
//         // Verify received address if exist in our DB
//         dbScripts.getAddressRecord(res, details.address).then(function(addrResponse){
//           //PROCEED IF ADDRESS IS EXISTING IN EASYDEX DB
//           var resAddrJSONData = JSON.parse(JSON.stringify(addrResponse));
//           console.log("resAddrJSONData: ", resAddrJSONData);
//
//           if(resAddrJSONData && resAddrJSONData.length === 1){
//             //TODO Check if DB transaction record exists
//             // 4 STEP
//             //Insert txInfo into DB
//             dbScripts.insertTransaction(res, req, txData, 'deposit', currentUtcTime)
//               .then( function(r) {
//                 //Call tx-confirmations polling script
//                 //console.log("ADDRESS: ",txData);
//                 // 5 STEP
//                 //START POLLING
//                 pollTxConfirmations(manager, txData, receivedConfirmations, res, details);
//               })
//               .catch(err => {
//                 console.log("ERROR: ", err);
//                 var errMsg = "DB insertTransaction() fails!";
//                 console.log(errMsg);
//                 res.send(JSON.stringify({"status": 500, "error": errMsg, "response":""}));
//                 return;
//               });
//
//           } else {
//             var errMsg = "Skip wallet notification, the address is not recognized!";
//             console.log(errMsg);
//             res.send(JSON.stringify({"status": 500, "error": errMsg, "response":""}));
//             return;
//           }
//
//         }).catch(function(err){
//           console.log("ERROR: ", err);
//           var errMsg = "DB getAddressRecord() fails.";
//           console.log(errMsg);
//           res.send(JSON.stringify({"status": 500, "error": errMsg, "response":""}));
//           return;
//         });
//       } else {
//         var errMsg = "There is no transaction details data!";
//         console.log(errMsg);
//         res.send(JSON.stringify({"status": 500, "error": errMsg, "response":""}));
//         return;
//       }
//     }
//   });
//
//   //res.send(JSON.stringify({"status": 500, "error": "New address could not be obtained", "response":""}));
//   //res.send(JSON.stringify({"status": 200, "error": null, "response": "success"}))
// };
//
// function pollTxConfirmations(manager, txData, initConfirmations, res, txDetails) {
//   var txid = txData.txid;
//   var address = txDetails.address;
//   //console.log("txid: ", txData.txid);console.log("initConfirmations: ", initConfirmations);
//
//   //var counter = initConfirmations > 0 ? initConfirmations : 0;
//
//   //START POLLING
//   var id = setInterval( function () {
//     //console.log('setInterval counter: ', counter);
//     //console.log('setInterval txid: ', txid);console.log('setInterval address: ', address);console.log('setInterval initConfirmations: ',initConfirmations);
//     //console.log('-----------------------------------------------------------------');
//
//     //CHECK INITIAL CONFIRMATIONS, IF THEY ARE >=3 , STOP POLLING
//     if(initConfirmations && initConfirmations >= CONST.MIN_CONFORMATIONS) {
//       clearInterval(id);//STOP INTERVAL LOOP
//       proceedRequestWithReceiverData(res, address, txid, initConfirmations);
//     }
//     //CONTINUE POLLING CONFIRMATIONS
//     else {
//       //FOR REAL
//       manager.getTransaction(txid, function (err, data) {
//         if (err) {
//           clearInterval(id);
//           throw err;
//         }
//
//         var txData = JSON.parse(JSON.stringify(data));
//         var confs = parseInt(txData.confirmations);
//
//         // console.log('setInterval address: ', address);
//         // console.log('setInterval txid: ', txid);
//         // console.log('setInterval initConfirmations: ',initConfirmations);
//         // console.log('setInterval loop confirmations: ', confs);
//         // console.log('-----------------------------------------------------------------');
//
//         if (confs && confs >= CONST.MIN_CONFORMATIONS) {
//           clearInterval(id);console.log("polling was stopped, counter limit (" + txData.confirmations + ") is reached");
//
//           proceedRequestWithReceiverData(res, address, txid, confs);
//         }
//       });
//
//     }
//   }, CONST.POLL_INTERVAL);
// }
//
// function proceedRequestWithReceiverData(res, address, txid, confs) {
//   dbScripts.getTransactionOwnerData(res, address, txid).then(function(userTxData){
//     var resJSONData = JSON.parse(JSON.stringify(userTxData));
//     //console.log("userTxData: ", resJSONData);
//
//     var pyBtsClient =  new zerorpc.Client();
//
//     //pyBtsClient.connect("tcp://127.0.0.1:4242");
//     pyBtsClient.on("error", function(error) {
//       console.error("RPC client error:", error);
//     });
//
//     //Run the last part of transaction -> pass the information to Bitshares
//     var reconnCounter = 0;
//     var id = setInterval( function () {
//       reconnCounter++;
//       pyBtsClient.connect("tcp://127.0.0.1:4242");
//       //TEST CONNECTION
//       pyBtsClient.invoke("ping", function(e, r, m){
//         if(e) {
//           console.error("ERROR PING:: ",e);
//           var errMsg = "Py (ping) failed.";
//           console.log("reconnCounter: ",reconnCounter)
//           console.log(errMsg);
//
//           if(reconnCounter>10) {
//             console.log("Limit of reconnections is exceeded." );
//             clearInterval(id);//STOP INTERVAL LOOP
//             res.send(JSON.stringify({"status": 500, "error": errMsg, "response":e}));
//             return;
//           }
//
//         } else {
//           //console.log("PING response: ",r);
//           clearInterval(id);//STOP INTERVAL LOOP
//           pushTransaction(res, txid, confs, resJSONData, pyBtsClient);
//         }
//
//
//       });
//     },5000);
//
//
//   }).catch(function(err){
//     console.log("ERROR:: ",err);
//     var errMsg = "DB query fails(getTransactionOwnerData).";
//     console.log(errMsg);
//     res.send(JSON.stringify({"status": 500, "error": errMsg, "response":""}));
//     return;
//   });
// }
//
// function pushTransaction (res, txid, confs, userTxData, pyBtsClient) {
//   var to = userTxData[0].username;
//   var amount = userTxData[0].amount;
//   var status = "";
//
//   //1 STEP
//   pyBtsClient.invoke("get_account", to, function(error1, resp1, more1) {
//     if(error1) {
//       status = "failed";
//       console.error("ERROR1:: ",error1);
//       var errMsg = "Py (get_account) failed.";
//       console.log(errMsg);
//       res.send(JSON.stringify({"status": 500, "error": errMsg, "response":""}));
//       return;
//     }
//     else if(resp1) {
//       //BUILD TX-JSON
//       var toAccountId = JSON.parse(JSON.stringify(resp1)).id;
//       var txJson = JSON.stringify(buildTxJson(toAccountId, amount));
//
//       //console.log("prepared JSON for SEND TRANSACTION: ",txJson);
//       //2 STEP
//       pyBtsClient.invoke("send_transaction", txJson, function (error, response, more) {
//         var errMsg = "";
//         var parsedResp = null;
//
//         if (error) {
//           status = "failed";
//           console.error("ERROR2:: ", error);
//         }
//         //console.log("RESPONSE 2 send_transaction: ", response);
//         if(response){
//           parsedResp = JSON.parse(JSON.stringify(response));
//         } else {
//           console.log("RESPONSE 2 send_transaction is undefined: ", response);
//         }
//
//         if (parsedResp == "true") {
//           status = "successful";
//         } else {
//           status = "failed";
//         }
//         pyBtsClient.close();
//
//         //3 STEP
//         dbScripts.updateTxConfirmations(res, txid, confs, status).then((r) => {
//           if(r){
//             console.log("Transaction confirmations and status have been updated.");
//           }
//         }).catch((err) => {
//           console.log("ERR-UPDATE::", err);
//           var errMsg = "Transaction confirmations and status have not been updated.";
//           console.log(errMsg);
//           //res.send(JSON.stringify({"status": 500, "error": errMsg, "response":""}));
//           return;
//         });
//         if (!more) {
//           //console.log("Done.");
//         }
//         if (status === "successful") {
//           res.send(JSON.stringify({"status": 200, "error": null, "response": "success"}))
//         } else {
//           status = "failed";
//           errMsg = "Py (send_transaction) failed.";
//           console.log(errMsg);
//           res.send(JSON.stringify({"status": 500, "error": errMsg, "response":""}));
//         }
//
//       });
//     }
//   });
// }
//
// function buildTxJson(to, amount) {
//   var amountR = round(amount * constants.WALLETNOTIFY.ONE_LITECOIN_SATS, 1);
//   console.log("ORIGINAL AMOUNT: ",amount);
//   console.log("ROUNDED AMOUNT: ",amountR);
//   var json = {
//     "fee": {
//       "amount": 0,
//       "asset_id": mainConstants.ASSETS.MAIN.ID
//     },
//     "from": mainConstants.MAIN_ACCOUNT.ID,
//     "to": to,
//     "amount": {
//       "amount": amountR,
//       "asset_id": mainConstants.ASSETS.EASYDEX.BTC.ID
//     },
//     "extensions": []
//   };
//   return json;
//
// }
//
// function findProperDetailsObj(detailsArr) {
//   if(detailsArr instanceof Array) {
//     if(detailsArr.length > 0) {
//       for(var obj in detailsArr) {
//         if(detailsArr[obj].category === "receive"){
//           return detailsArr[obj];
//         }
//       }
//     } else {
//       console.log("Length of Array is: ", detailsArr.length);
//       console.log("detailsArr : ", detailsArr);
//       return null;
//     }
//   } else {
//     console.log("Given object is not Array")
//     return null;
//   }
// }
//
// function round(value, decimals) {
//   return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
// }
//
// module.exports.walletnotify = walletnotify;






//NEW VERSION
var dbScripts = require('../db-scripts/transaction');
var constants = require('../constants/ltc-constants');
var mainConstants = require('../../../common/constants');
var config = require('../../../../api-server.config').getLitecoinConfig();
var litecoin = require('litecoin');
var getCurrentUTCtime = require('../../../../api-helpers/dateHelper').getCurrentUTCtime;
var zerorpc = require("zerorpc");
var logger = require('../../../../logger/logger').logger;
var formatLogMsg = require('../../../common/utils/loggerHelper').formatLogMsg;
var logContext = mainConstants.LOG_ACTION_CONTEXT.DEPOSIT;
var logMessage = "";

var CONST = constants.WALLETNOTIFY;
var walletnotify = (req, res, next) => {

  var txId = req.query.tx;

  console.log("DEPOSIT LTC req.query.tx: ",txId);

  var manager = new litecoin.Client(config);

  logMessage = formatLogMsg('INFO', req.query, "Request LTC Wallet notification", {txId: txId}, null, logContext);
  logger.log('info', logMessage);
  console.log("WALLET NOTIFY SCRIPT WAS CALLED");
  // 1 STEP
  manager.getTransaction(txId, function(err, data) {
    if (err){
      var errMsg = "LTC node, getTransaction() method returns err!";

      logMessage = formatLogMsg('ERROR', req.query, errMsg, null, err, logContext);
      logger.log('error', logMessage);
      res.status(500);
      res.send(JSON.stringify({"status": 500, "error": "error", "response":""}));
      return;
    }
    if(data) {
      console.log("WALLET NOTIFY 1.0 raw  data: ", data);
      var txData = null;
      try{
        txData = JSON.parse(JSON.stringify(data));
        console.log("WALLET NOTIFY 1 data: ", txData);
      }
      catch (err) {
        logMessage = formatLogMsg('ERROR', req.query, "Given LTC tx data cannot be parsed!", null, err, logContext);
        logger.log('error',logMessage);
        res.status(500);
        res.send(JSON.stringify({"status": 500, "error": "error", "response":""}));
        return;
      }

      txData = txData.result || txData;
      var receivedConfirmations = txData.confirmations;
      var isValidAmount = txData.amount >= mainConstants.ASSETS.EASYDEX.LTC.MIN_DEPOSIT_AMOUNT ;

      logger.log('info', "txData: "+JSON.stringify(txData));
      logger.log('info', "Amount: "+txData.amount);
      logger.log('info', "Amount is valid: "+isValidAmount);
      logger.log('info', "Received Confirmations: "+receivedConfirmations);

      //SKIP NOTIFICATION
      if(receivedConfirmations === 0) {
        logger.log('info', "Skipp LTC notification (conf=" + receivedConfirmations + ")");
        res.status(200);
        res.send(JSON.stringify({"status": 200, "error": "", "response":""}));
        return;
      }
      // 2 STEP
      else if(receivedConfirmations && receivedConfirmations >= 1) {
        console.log("WALLET NOTIFY STEP 2");
        //SKIP TRANSACTION WHEN AMOUNT LESS THAN MINIMUM
        //TODO UNCOMMENT after testing
        if(!isValidAmount) {
          logMessage = formatLogMsg('ERROR', req.query, "LTC Amount is not valid! Transaction will be skipped!", null, null, logContext);
          logger.log('error',logMessage);
          res.status(500);
          res.send(JSON.stringify({"status": 500, "error": "", "response":""}));
          return;
        }

        var details = findProperDetailsObj(txData.details);
        var currentUtcTime = getCurrentUTCtime();

        console.log("WALLET NOTIFY STEP 3.0: ",details);
        if(details) {
          logMessage = formatLogMsg('INFO', null, "LTC proper tx details for deposit", details , null, logContext);
          logger.log('info', logMessage);
          console.log("WALLET NOTIFY STEP 3");
          // 3 STEP
          // Verify received address if exist in our DB
          dbScripts.getAddressRecord(res, details.address).then(function(addrResponse){
            //PROCEED IF ADDRESS IS EXISTING IN EASYDEX DB
            var resAddrJSONData = JSON.parse(JSON.stringify(addrResponse));
            logMessage = formatLogMsg('INFO', null, "LTC DB getAddressRecord()", addrResponse , null, logContext);
            logger.log('info', logMessage);

            if(resAddrJSONData && resAddrJSONData.length === 1){
              console.log("WALLET NOTIFY STEP 4");
              // 4 STEP
              //Insert txInfo into DB
              dbScripts.insertTransaction(res, req, txData, 'deposit', currentUtcTime)
                .then( function(r) {
                  logMessage = formatLogMsg('INFO', null, "LTC DB transaction data was succesfully saved.", null , null, logContext);
                  logger.log('info', logMessage);

                  console.log("WALLET NOTIFY STEP 5");
                  //Call tx-confirmations polling script
                  // 5 STEP
                  //START POLLING
                  pollTxConfirmations(manager, txData, receivedConfirmations, res, details);
                })
                .catch(err => {
                  var errMsg = "LTC DB insertTransaction() failed!";

                  logMessage = formatLogMsg('ERROR', txData, errMsg, null, err, logContext);
                  logger.log('error',logMessage);
                  res.status(500);
                  res.send(JSON.stringify({"status": 500, "error": "error", "response":""}));
                  return;
                });

            } else {
              var errMsg = "LTC Skip wallet notification, the address is not recognized!";
              logMessage = formatLogMsg('ERROR', req.query, errMsg, null, null, logContext);
              logger.log('error',logMessage);
              res.status(500);
              res.send(JSON.stringify({"status": 500, "error": "error", "response":""}));
              return;
            }

          }).catch(function(err){
            var errMsg = "LTC DB getAddressRecord() failed.";
            logMessage = formatLogMsg('ERROR', req.query, errMsg, null, err, logContext);
            logger.log('error',logMessage);
            res.status(500);
            res.send(JSON.stringify({"status": 500, "error": "error", "response":""}));
            return;
          });
        } else {
          var errMsg = "There is no LTC transaction details data!";
          logMessage = formatLogMsg('ERROR', req.query, errMsg, null, null, logContext);
          logger.log('error',logMessage);
          res.status(500);
          res.send(JSON.stringify({"status": 500, "error": "error", "response":""}));
          return;
        }
      }
    }

  });
};

function pollTxConfirmations(manager, txData, initConfirmations, res, txDetails) {
  var txid = txData.txid;
  var address = txDetails.address;
  logger.log('info', "initConfirmations in pollTxConfirmations() : "+initConfirmations);

  //START POLLING
  var id = setInterval( function () {
    console.log('setInterval txid: ', txid);console.log('setInterval address: ', address);console.log('setInterval initConfirmations: ',initConfirmations);
    console.log('-----------------------------------------------------------------');

    //CHECK INITIAL CONFIRMATIONS, IF THEY ARE >=3 , STOP POLLING
    if(initConfirmations && initConfirmations >= CONST.MIN_CONFORMATIONS) {
      clearInterval(id);//STOP INTERVAL LOOP
      proceedRequestWithReceiverData(res, address, txid, initConfirmations);
    }
    //CONTINUE POLLING CONFIRMATIONS
    else {
      //FOR REAL
       manager.getTransaction(txid, function (err, data) {
         if (err) {
           clearInterval(id);
           var errMsg = "LTC node, setInterval()-> getTransaction() method failed!";
           logMessage = formatLogMsg('ERROR', null, errMsg, {txid:txid,address:address,initConfs:initConfirmations}, err, logContext);
           logger.log('error', logMessage);
           res.status(500);
           res.send(JSON.stringify({"status": 500, "error": "error", "response":""}));
           return;
         }

         var txData = null;
         var confs = null;
         try {
           txData = JSON.parse(JSON.stringify(data));
           confs = parseInt(txData.confirmations);
         }
         catch (err) {
           clearInterval(id);
           var errMsg = "LTC node, setInterval()-> getTransaction() data cannot be parsed!";
           logMessage = formatLogMsg('ERROR', null, errMsg, {txid:txid,address:address,initConfs:initConfirmations}, err, logContext);
           logger.log('error', logMessage);
           res.status(500);
           res.send(JSON.stringify({"status": 500, "error": "error", "response":""}));
           return;
         }

         logger.log('info', 'setInterval address: ' + address);
         logger.log('info', 'setInterval txid: ' + txid);
         logger.log('info', 'setInterval initConfirmations: ' + initConfirmations);
         logger.log('info', 'setInterval loop confirmations: ' + confs);
         logger.log('info', '-----------------------------------------------------------------');

         if (confs && confs >= CONST.MIN_CONFORMATIONS) {
           clearInterval(id);
           logger.log('info', "Polling was stopped, confs limit (" + confs + ") is exceeded");
           proceedRequestWithReceiverData(res, address, txid, confs);
         }
       });

    }
  }, CONST.POLL_INTERVAL);
}

function proceedRequestWithReceiverData(res, address, txid, confs) {
  dbScripts.getTransactionOwnerData(res, address, txid).then(function(userTxData){
    var resJSONData = null;

    try {
      resJSONData = JSON.parse(JSON.stringify(userTxData));
      console.log("WALLET NOTIFY STEP 6");
    }
    catch (err) {
      var errMsg = "LTC node, proceedRequestWithReceiverData()-> DB getTransactionOwnerData() data cannot be parsed!";
      logMessage = formatLogMsg('ERROR', null, errMsg, {txid:txid,address:address,confs:confs}, err, logContext);
      logger.log('error', logMessage);
      res.status(500);
      res.send(JSON.stringify({"status": 500, "error": "error", "response":""}));
      return;
    }

    var pyBtsClient =  new zerorpc.Client();
    pyBtsClient.connect(mainConstants.ZERORPC.CONN_ADDRESS.LTC);
    pyBtsClient.on("error", function(error) {
      console.error("Zero RPC client error:", error);
      logMessage = formatLogMsg('ERROR', null, "LTC Zero RPC client error", {txid:txid,address:address,confs:confs}, error, logContext);
      logger.log('error', logMessage);
    });

    var reconnCounter = 0;


    //FIRST ATTEMPT
    pyBtsClient.invoke("ping", function(er, r, m){
      if(er) {
        logger.log('info', 'First attempt to connect LTC Py (ping) failed.');
        logger.log('info', "ERROR PING:: " + er);

        //START RECONNECTION LOOP
        var id = setInterval( function () {
          reconnCounter++;
          pyBtsClient.connect(mainConstants.ZERORPC.CONN_ADDRESS.LTC);
          //TEST CONNECTION
          pyBtsClient.invoke("ping", function(e, r, m){
            if(e) {
              logger.log('info', 'NEXT attempt['+reconnCounter+'] to connect LTC Py (ping) failed.');
              logger.log('info', "NEXT ERROR PING:: " + e);

              if(reconnCounter>mainConstants.ZERORPC.RECONN_ATTEMPTS) {
                clearInterval(id);//STOP INTERVAL LOOP

                var errMsg = "LTC Limit of reconnections is exceeded. There is no available connection to proceed.";
                logMessage = formatLogMsg('ERROR', null, errMsg, {address:address,txid:txid,confs:confs}, err, logContext);
                logger.log('error',logMessage);
                res.status(500);
                res.send(JSON.stringify({"status": 500, "error": "error", "response":""}));
                return;
              }

            } else {
              console.log("WALLET NOTIFY STEP 7");
              clearInterval(id);//STOP INTERVAL LOOP
              logger.log('info', "Now we have connection on[" + reconnCounter + "] attempt.");
              logger.log('info', "PING response: " + r);
              pushTransaction(res, txid, confs, resJSONData, pyBtsClient);
            }
          });
        },mainConstants.ZERORPC.RECONN_INTERVAL);
      }
      else {
        console.log("WALLET NOTIFY STEP 7.2");
        logger.log('info', 'First attempt to connect LTC Py (ping) is OK. result='+r);
        pushTransaction(res, txid, confs, resJSONData, pyBtsClient);

      }
    });
  })
  .catch(function(err){
    var errMsg = "LTC DB query fails(getTransactionOwnerData).";
    logMessage = formatLogMsg('ERROR', null, errMsg, {address:address,txid:txid,confs:confs}, err, logContext);
    logger.log('error',logMessage);
    res.status(500);
    res.send(JSON.stringify({"status": 500, "error": "error", "response":""}));
    return;
  });
}

function pushTransaction (res, txid, confs, userTxData, pyBtsClient) {
  var to = userTxData[0].username;
  var amount = userTxData[0].amount;
  var status = "";

  //1 STEP
  pyBtsClient.invoke("get_account", to, function(error1, resp1, more1) {
    if(error1) {
      status = "failed";
      var errMsg = "LTC Py (get_account) failed. Cannot to proceed sending transaction!";
      logMessage = formatLogMsg('ERROR', null, errMsg, {txid:txid,to:to,status:status,amount:amount}, error1, logContext);
      logger.log('error',logMessage);
      res.status(500);
      res.send(JSON.stringify({"status": 500, "error": errMsg, "response":""}));
      return;
    }
    else if(resp1) {
      console.log("WALLET NOTIFY STEP 8");
      //BUILD TX-JSON
      var getAccountResp = null;
      try {
        getAccountResp = JSON.parse(JSON.stringify(resp1));
      }
      catch (err) {
        var errMsg = "LTC Py (get_account) result cannot be parsed!";
        logMessage = formatLogMsg('ERROR', null, errMsg, {address:address,txid:txid,confs:confs,get_account_resp:resp1}, err, logContext);
        logger.log('error',logMessage);
        res.status(500);
        res.send(JSON.stringify({"status": 500, "error": "error", "response":""}));
        return;
      }

      var toAccountId = getAccountResp.id;
      var txJson = JSON.stringify(buildTxJson(toAccountId, amount));
      logger.log('info', "LTC pushTransaction() - JSON for Py send_transaction: " + txJson);

      //2 STEP
      pyBtsClient.invoke("send_transaction", txJson, function (error, response, more) {
        var errMsg = "";
        var parsedResp = null;

        if (error) {
          status = "failed";
          errMsg = "LTC Py (send_transaction) failed!";
          logMessage = formatLogMsg('ERROR', null, errMsg, {txid:txid,to:to,status:status,amount:amount}, error, logContext);
          logger.log('error',logMessage);
        }
        //console.log("RESPONSE 2 send_transaction: ", response);
        if(response){
          console.log("WALLET NOTIFY STEP 9");
          parsedResp = JSON.parse(JSON.stringify(response));
          logger.log('info', "LTC pushTransaction() - response from send_transaction: " + response);
          logger.log('info', "LTC pushTransaction() - parsed response from send_transaction: " + parsedResp);
        } else {
          logger.log('info', "LTC pushTransaction() - response from send_transaction is undefined " + response);
        }

        if (parsedResp == "true") {
          status = "successful";
        } else {
          status = "failed";
        }
        pyBtsClient.close();
        pyBtsClient = null;
        logger.log('info', "LTC zero RPC connection is closed normally.");
        var currDate = getCurrentUTCtime();
        //3 STEP
        //Update DB tx record
        dbScripts.updateTxConfirmations(res, txid, confs, status, currDate).then((r) => {
          if(r){
            console.log("WALLET NOTIFY STEP 10");
            logger.log('info', "LTC Transaction confirmations and status have been updated.");
            logger.log('info', "LTC Transaction end date[" + currDate + "].");
          }
        }).catch((err) => {
          errMsg = "LTC Transaction confirmations and status have not been updated.";
          logMessage = formatLogMsg('ERROR', null, errMsg, {txid:txid,to:to,amount:amount,confs:confs}, err, logContext);
          logger.log('error',logMessage);
          res.status(500);
          res.send(JSON.stringify({"status": 500, "error": "error", "response":""}));
          return;
        });

        if (status === "successful") {
          res.status(200);
          res.send(JSON.stringify({"status": 200, "error": null, "response": "success"}))
          return;
        } else {
          status = "failed";
          errMsg = "Py LTC (send_transaction) failed.";
          logMessage = formatLogMsg('ERROR', null, errMsg, {txid:txid,to:to,amount:amount,confs:confs,status:status}, err, logContext);
          logger.log('error',logMessage);
          res.status(500);
          res.send(JSON.stringify({"status": 500, "error": "error", "response":""}));
          return;
        }
      });
    }
  });
}

function buildTxJson(to, amount) {
  var amountR = round(amount * constants.WALLETNOTIFY.ONE_LITECOIN_SATS, 1);
  // console.log("ORIGINAL AMOUNT: ",amount);
  // console.log("ROUNDED AMOUNT: ",amountR);
  var json = {
    "fee": {
      "amount": 0,
      "asset_id": mainConstants.ASSETS.MAIN.ID
    },
    "from": mainConstants.MAIN_ACCOUNT.ID,
    "to": to,
    "amount": {
      "amount": amountR,
      "asset_id": mainConstants.ASSETS.EASYDEX.LTC.ID
    },
    "extensions": []
  };
  return json;

}

function findProperDetailsObj(detailsArr) {
  if(detailsArr instanceof Array) {
    if(detailsArr.length > 0) {
      for(var obj in detailsArr) {
        if(detailsArr[obj].category === "receive"){
          return detailsArr[obj];
        }
      }
    } else {
      // console.log("Length of Array is: ", detailsArr.length);
      // console.log("detailsArr : ", detailsArr);
      return null;
    }
  } else {
    //console.log("Given object is not Array")
    return null;
  }
}

function round(value, decimals) {
  return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
}

module.exports.walletnotify = walletnotify;

