
var currentENV = "";
var server = "";

if(process.env.NODE_ENV) {
  currentENV = (process.env.NODE_ENV).trim();
} else {
  currentENV = "development";
}

console.log("UI ENV STAGING: ",process.env.STAGING);
console.log("UI CURR ENV: ",currentENV);

////PRODUCTION SERVER////////////////////////////

  server = currentENV === 'production' ? 'https://exchange.easydex.net/' : 'http://localhost:8080/';

  //TESTING
  currentENV= "development";//remove after testing
  var nodeJsApiServer = currentENV === 'production' ? 'https://5.189.130.184:3001/' : 'http://5.189.130.184:3007/';

  //PRODUCTION
  // var nodeJsApiServer = currentENV === 'production' ? 'https://api.easydex.net/' : 'https://api.easydex.net/';

////PRODUCTION SERVER////////////////////////////

console.log("API SERVER: ", nodeJsApiServer);
console.log("SERVER: ", server);

export default {
  NODE_JS_API: {
    SERVER: nodeJsApiServer,
    URLS: {
      "getBtcAddress": "api/v1/get-bitcoin-address",
      "validateAddress": "api/v1/validate-address",
      "saveWithdrawData": "api/v1/save-withdraw",
      "getLatestTxIds":  "api/v1/get-latest-txids",
      coins: {
        COINS_LIST: "api/v1/get-available-assets"
      },
      saveWithdraw: {
        btc: "api/v1/save-withdraw",
        steem: "api/v1/steem-sbd-save-withdraw",
        sbd: "api/v1/steem-sbd-save-withdraw"
      }
    }
  },
  SERVER: server,
  URLS: {
    "saveEncPass": "api/account/saveEncPass",
    "getAndSendAnswer": "api/account/getAndSendAnswer",
    "verifyToken": "api/account/verifyToken",
    "verifyAnswer": "api/account/verifyAnswer"
  }
};