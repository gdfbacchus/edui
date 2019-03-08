var config = require('../../../../api-server.config').getBitcoinConfig();
var dbScripts = require('../db-scripts/address');
var constants = require('../constants/eth-constants');
var zerorpc = require("zerorpc");
var mainConstants = require('../../../common/constants');

var constants_common = require('../../../common/constants');
var logger = require('../../../../logger/logger').logger;
var formatLogMsg = require('../../../common/utils/loggerHelper').formatLogMsg;
var logContext = constants_common.LOG_ACTION_CONTEXT.GET_ADDRESS;
var blackListedAddr = constants_common.BLACK_LISTED_ADDRESSES.ETH;
var logMessage = "";
var errMsg = "";
var msg = "";



var getAddress = (req,res,next) => {
  var asset = req.body.asset;
  var username = req.body.username;
  //var manager = btcClient.makeClient();

  dbScripts.getExistingAddress(req,res).then(function (results) {
    //RETURN EXISTING ADDRESS
    if (results && results.length>0) {
      var resJSONData = JSON.parse(JSON.stringify({address: results[0].address}));
      msg ="FETCH EXISTING ETH ADDRESS: "+results[0].address;

      if(blackListedAddr[results[0].address]) {

        errMsg = "ETH address is black listed!";
        logMessage = formatLogMsg('ERROR', null, errMsg, null, null, logContext);
        logger.log('error',logMessage);
        res.status(500);
        res.send(JSON.stringify({"status": 500, "error": "addr error", "response":""}));
        return;
      }

      logMessage = formatLogMsg('info', req.body, msg, null, null, logContext);
      logger.log('info', logMessage);
      res.status(200);
      res.send(JSON.stringify({"status": 200, "error": "", "response":resJSONData}));
      return;
    } else {
      //GET NEW ADDRESS

      msg = "Address not existing for this account["+ username +"] and asset[" + asset + "], must be created.";
      logger.log('info', msg);

      var pyBtsClient =  new zerorpc.Client();
      pyBtsClient.connect(mainConstants.ZERORPC.CONN_ADDRESS.ETH);
      pyBtsClient.on("error", function(error) {
        console.error("Zero RPC client error:", error);
        logMessage = formatLogMsg('ERROR', null, "ETH Zero RPC client error", null, error, logContext);
        logger.log('error', logMessage);
      });

      //TEST CONNECTION
      pyBtsClient.invoke("ping", function(er, r, m){
        if(er) {
          pyBtsClient.close();
          pyBtsClient = null;
          errMsg = "ETH method Py ping() failed.";
          logMessage = formatLogMsg('ERROR', null, errMsg, null, er, logContext);
          logger.log('error',logMessage);
          res.status(500);
          res.send(JSON.stringify({"status": 500, "error": "", "response":""}));
          return;
        }
        else {

          pyBtsClient.invoke("get_eth_account", username , function(err, resp, m){
            if(err) {
              errMsg = "ETH method get_eth_account() failed.";
              logMessage = formatLogMsg('ERROR', null, errMsg, null, err, logContext);
              logger.log('error',logMessage);
              res.status(500);
              res.send(JSON.stringify({"status": 500, "error": "Get eth address error.", "response":""}));
              return;
            }
            else {
              var address = null;
              try {
                address = JSON.parse(JSON.stringify(resp));
              }
              catch (err) {
                errMsg = "ETH Py (get_eth_account) result cannot be parsed!";
                logMessage = formatLogMsg('ERROR', null, errMsg, {address:address,get_eth_account_resp:resp}, err, logContext);
                logger.log('error',logMessage);
                res.status(500);
                res.send(JSON.stringify({"status": 500, "error": "GET ETH ADDRESS ERROR", "response":""}));
                return;
              }

              logger.log('info', "NEW ADDRESS: "+address);

              if(address) {

                msg ="New Address has been obtained.";
                logMessage = formatLogMsg('INFO', null, msg, null, null, logContext);
                logger.log('info', logMessage);
                res.status(200);
                res.send(JSON.stringify({"status": 200, "error": null, "response": {address: address} }));
                return;
                /* //INSERT NEW ADDRESS INTO DB
                dbScripts.getAssetInfo(res, asset)
                  .then(function(data){
                    if(data.length < 1){
                      errMsg = 'GET ADDRESS, Asset ['+asset+'] not exists';
                      logMessage = formatLogMsg('ERROR', req.body, errMsg, null, null, logContext);
                      logger.log('error',logMessage);
                      res.status(500);
                      res.send(JSON.stringify({"status": 500, "error": errMsg , "response":""}));
                      return;
                    }
                    var resJSONData = JSON.parse(JSON.stringify(data));
                    var assetId = resJSONData[0].id;

                    logger.log('info', "GET ETH ADDRESS, ASSET ID: "+assetId);

                    var addrData = {
                      address: address,
                      username: username,
                      assetId: assetId
                    };
                    logger.log('info', "GET ETH ADDRESS, Data to insert: "+ JSON.stringify(addrData));

                    dbScripts.insertAddress(res, addrData).then(function (result) {
                      msg ="New Address has been inserted.";
                      logMessage = formatLogMsg('INFO', null, msg, null, null, logContext);
                      logger.log('info', logMessage);
                      res.status(200);
                      res.send(JSON.stringify({"status": 200, "error": null, "response": {address: address} }));
                    }).catch(function(err){
                      errMsg = "GET ETH ADDRESS - New address was not inserted."
                      logMessage = formatLogMsg('ERROR', req.body, errMsg, null, err, logContext);
                      logger.log('error',logMessage);
                      res.status(500);
                      res.send(JSON.stringify({"status": 500, "error": errMsg, "response":""}));
                      return;
                    });

                  })
                  .catch(function(err){
                    errMsg = "GET ETH ADDRESS - DB getAssetInfo method failed."
                    logMessage = formatLogMsg('ERROR', req.body, errMsg, null, err, logContext);
                    logger.log('error',logMessage);
                    res.status(500);
                    res.send(JSON.stringify({"status": 500, "error": errMsg, "response":""}));
                    return;
                  });
                */
              } else {
                errMsg = "New ETH address could not be obtained.";
                logMessage = formatLogMsg('ERROR', req.body, errMsg, null, null, logContext);
                logger.log('error',logMessage);
                res.status(500);
                res.send(JSON.stringify({"status": 500, "error": "", "response":""}));
                return;
              }
            }
          });
        }
      });
    }
  }).catch(function (err) {
    errMsg = "GET ETH ADDRESS - DB getExistingAddress method failed."
    logMessage = formatLogMsg('ERROR', req.body, errMsg, null, err, logContext);
    logger.log('error',logMessage);
    res.status(500);
    res.send(JSON.stringify({"status": 500, "error": errMsg, "response":""}));
    return;
  });
};

module.exports.getAddress = getAddress;

