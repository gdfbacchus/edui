var express  = require('express'),
  protect = require('@risingstack/protect'),
  cors = require('cors'),
  path = require('path'),
  bodyParser = require('body-parser'),
  app = express(),
  mysql = require('mysql'),
  dbHelper = require('./api-helpers/dbHelper'),
  getCurrentUTCtime = require('./api-helpers/dateHelper').getCurrentUTCtime;

var constants_common = require('./routes/common/constants');
var logger = require('./logger/logger').logger;
var formatLogMsg = require('./routes/common/utils/loggerHelper').formatLogMsg;
var logContext = constants_common.LOG_ACTION_CONTEXT.REQUEST;
var logMessage = "";
var errMsg = "";

var mysqlConnectionPool = dbHelper.createMysqlPool;
var db_config = require('./api-server.config').getDbSettings();

// var dbSettings = require('./api-server.config').getDbSettings();
// console.log("API db settings: ",dbSettings);

var currentENV = process.env.NODE_ENV ? (process.env.NODE_ENV).trim() : 'development';
logger.log('info',"========================START SERVER=================================");
logger.log('info','ENV: '+currentENV);
logger.log('info','OS: '+ process.platform);

app.use(cors());
//app.use(bodyParser.urlencoded({ extended: true })); //support x-www-form-urlencoded
try {
  app.use(bodyParser.json());
} catch (err) {
  errMsg = "APP Request cannot be parsed"
  logMessage = formatLogMsg('ERROR', null, errMsg, null, err, logContext);
  logger.log('error',logMessage);
}

//Protection for SQL injection attacks
app.use(protect.express.sqlInjection({
  body: true,
  // loggerFunction: console.error
  loggerFunction: (err) => {
    errMsg = "SQL injection attack";
    logMessage = formatLogMsg('ERROR', null, errMsg, null, err, "SQL injection attack");
    logger.log('error',logMessage);
  }
}));
//Protection for XSS attacks
app.use(protect.express.xss({
  body: true,
  // loggerFunction: console.error
  loggerFunction: (err) => {
    errMsg = "XSS attack";
    logMessage = formatLogMsg('ERROR', null, errMsg, null, err, "XSS attack");
    logger.log('error',logMessage);
  }
}));

var bitcoinRoutes = require("./routes/assets/bitcoin/index");
var litecoinRoutes = require("./routes/assets/litecoin/index");
var validateAddrRoute = require("./routes/validateAddrRoute");
var getAssetSettingsRoute = require("./routes/getAssetSettingsRoute");
var steem_sbd_routes = require("./routes/assets/steem-sbd/index");
var eth_routes = require("./routes/assets/ethereum/index");
var wls_routes = require("./routes/assets/whaleshare/index");
var transactionRoute = require("./routes/transaction/index");



app.use(function(req, res, next){
  //res.locals.connection = mysql_connection;
  if(global.SQLpool === undefined) {
    global.SQLpool = mysqlConnectionPool(db_config);
  }
  //res.locals.connectionPool = mysqlConnectionPool(db_config);
  res.locals.connectionPool = global.SQLpool;

  //res.locals.connection = mysql.createConnection(dbSettings);
  //res.locals.connection.connect();

  //res.locals.zerorpc_connection = zerorpc_conn;
  //res.locals.zerorpc_connection.connect("tcp://127.0.0.1:4242");
  //res.locals.zerorpc_connection.connect("tcp://127.0.0.1:4242");
  next();
});

app.use(function (req, res, next) {
  //console.log("APP REQUEST UTC Time: " + getCurrentUTCtime());
  logger.log('info',"========================APP REQUEST=================================");
  logger.log('info',"UTC Time " + getCurrentUTCtime());
  logger.log('info',"====================================================================");
  next()
});

//BTC routes
app.post('/api/v1/get-bitcoin-address', bitcoinRoutes.getAddress);
app.get('/api/v1/bitcoin-walletnotify', bitcoinRoutes.walletnotify);
//TODO UNCOMMENT TO UNBLOCK WITHDRAWALS
app.post('/api/v1/save-withdraw', bitcoinRoutes.saveWithdraw);
//app.post('/api/v1/btc-withdraw-tx', bitcoinRoutes.processReceivedBtsTx);

//STEEM and SBD routes
app.post('/api/v1/steem-sbd-deposit', steem_sbd_routes.depositRoute);
//TODO UNCOMMENT TO UNBLOCK WITHDRAWALS
app.post('/api/v1/steem-sbd-save-withdraw', steem_sbd_routes.saveWithdrawRoute);
app.post('/api/v1/steem-sbd-update-withdraw', steem_sbd_routes.updateWithdrawDataRoute);

//ETHEREUM routes
app.post('/api/v1/get-eth-address', eth_routes.getAddress);
app.post('/api/v1/eth-deposit', eth_routes.depositRoute);
//TODO UNCOMMENT TO UNBLOCK WITHDRAWALS
app.post('/api/v1/eth-save-withdraw', eth_routes.saveWithdrawRoute);
app.post('/api/v1/eth-update-withdraw', eth_routes.updateWithdrawDataRoute);

//LTC routes
app.post('/api/v1/get-ltc-address', litecoinRoutes.getAddress);
app.get('/api/v1/ltc-walletnotify', litecoinRoutes.walletnotify);
//TODO UNCOMMENT TO UNBLOCK WITHDRAWALS
app.post('/api/v1/ltc-save-withdraw', litecoinRoutes.saveWithdraw);
app.post('/api/v1/ltc-withdraw-tx', litecoinRoutes.processReceivedBtsTx);

//WLS routes
app.post('/api/v1/wls-deposit', wls_routes.depositRoute);
app.post('/api/v1/wls-save-withdraw', wls_routes.saveWithdrawRoute);
app.post('/api/v1/wls-update-withdraw', wls_routes.updateWithdrawDataRoute);

//TEST
//app.post('/api/v1/test-bts-transfer', bitcoinRoutes.testZerorpc);

//COMMON ROUTES
//Validate address
app.get('/api/v1/validate-address/wallets/*', validateAddrRoute.validateAddr);
app.post('/api/v1/get-available-assets', getAssetSettingsRoute.getAssetSettings);
app.post('/api/v1/get-latest-txids', transactionRoute.getLatestTxIdsRoute);

//start Server

var server = app.listen(3001,function(err){
  if (err) {
    return console.error(err);
  }
  //console.log("EasyDex API Listening on port %s",server.address().port);
  logger.log('info','PRODUCTION API Listening on port:: ' + server.address().port);
  logger.log('info',"START UTC Time: " + getCurrentUTCtime());
  logger.log('info',"=====================================================================");
});


// // Create an HTTPS service identical to the HTTP service.
// https.createServer(options, app).listen(3001);
// // Create an HTTP service.
// http.createServer(app).listen(3002);

