var config = require('../../../../api-server.config').getBitcoinConfig();
var kapitalize = require('kapitalize')();
var dbScripts = require('../db-scripts/address');
var constants = require('../constants/btc-constants');
var btcClient = require('../core/btcClient');

var constants_common = require('../../../common/constants');
var blackListedAddr = constants_common.BLACK_LISTED_ADDRESSES.BTC;
var logger = require('../../../../logger/logger').logger;
var formatLogMsg = require('../../../common/utils/loggerHelper').formatLogMsg;
var logContext = constants_common.LOG_ACTION_CONTEXT.GET_ADDRESS;
var logMessage = "";
var errMsg = "";
var msg = "";

var getAddress = (req,res,next) => {
  var asset = req.body.asset;
  var username = req.body.username;
  var manager = btcClient.makeClient();

  dbScripts.getExistingAddress(req,res).then(function (results) {
    if (results && results.length>0) {
      if(blackListedAddr[results[0].address]) {

        errMsg = "BTC address is black listed!";
        logMessage = formatLogMsg('ERROR', null, errMsg, null, null, logContext);
        logger.log('error',logMessage);
        res.status(500);
        res.send(JSON.stringify({"status": 500, "error": "addr error", "response":""}));
        return;
      }

      var resJSONData = JSON.parse(JSON.stringify({address: results[0].address}));
      msg ="FETCH EXISTING ADDRESS: "+results[0].address;
      logMessage = formatLogMsg('info', req.body, msg, null, null, logContext);
      logger.log('info', logMessage);
      res.status(200);
      res.send(JSON.stringify({"status": 200, "error": "", "response":resJSONData}));
      return;
    } else {
      manager.getNewAddress(function(err, address) {
        if(err) {
          //throw err
          errMsg = "Get new address: getNewAddress() method failed.";
          logMessage = formatLogMsg('ERROR', req.body, errMsg, null, err, logContext);
          logger.log('error',logMessage);
          res.status(500);
          res.send(JSON.stringify({"status": 500, "error": err, errMsg}));
          return;
        };

        logger.log('info', "NEW ADDRESS: "+address);

        if(address) {
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

              logger.log('info', "GET ADDRESS, ASSET ID: "+assetId);

              var addrData = {
                address: address,
                username: username,
                assetId: assetId
              };
              logger.log('info', "GET ADDRESS, Data to insert: "+ JSON.stringify(addrData));

              dbScripts.insertAddress(res, addrData).then(function (result) {
                msg ="New Address has been inserted.";
                logMessage = formatLogMsg('INFO', null, msg, null, null, logContext);
                logger.log('info', logMessage);
                res.status(200);
                res.send(JSON.stringify({"status": 200, "error": null, "response": {address: address} }));
              }).catch(function(err){
                errMsg = "GET ADDRESS - New address was not inserted."
                logMessage = formatLogMsg('ERROR', req.body, errMsg, null, err, logContext);
                logger.log('error',logMessage);
                res.status(500);
                res.send(JSON.stringify({"status": 500, "error": errMsg, "response":""}));
                return;
              });

            })
            .catch(function(err){
              errMsg = "GET ADDRESS - DB getAssetInfo method failed."
              logMessage = formatLogMsg('ERROR', req.body, errMsg, null, err, logContext);
              logger.log('error',logMessage);
              res.status(500);
              res.send(JSON.stringify({"status": 500, "error": errMsg, "response":""}));
              return;
            });

        } else {
          errMsg = "New address could not be obtained. Check bitcoind node, getNewAddress() do not provide address!";
          logMessage = formatLogMsg('ERROR', req.body, errMsg, null, null, logContext);
          logger.log('error',logMessage);
          res.status(500);
          res.send(JSON.stringify({"status": 500, "error": errMsg, "response":""}));
          return;
        }
        manager.validateAddress(address, console.log);
      });
    }
  }).catch(function (err) {
    errMsg = "GET ADDRESS - DB getExistingAddress method failed."
    logMessage = formatLogMsg('ERROR', req.body, errMsg, null, err, logContext);
    logger.log('error',logMessage);
    res.status(500);
    res.send(JSON.stringify({"status": 500, "error": errMsg, "response":""}));
    return;
  });
};

module.exports.getAddress = getAddress;

