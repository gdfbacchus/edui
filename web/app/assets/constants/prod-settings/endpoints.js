
var server = 'https://exchange.easydex.net/';
var nodeJsApiServer = 'https://api.easydex.net/';

////PRODUCTION SERVER////////////////////////////
  //server = currentENV === 'production' ? 'https://exchange.easydex.net/' : 'http://localhost:8080/';
  //TESTING
  // currentENV= "development";//remove after testing
  // var nodeJsApiServer = currentENV === 'production' ? 'https://5.189.130.184:3001/' : 'http://5.189.130.184:3007/';
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
      "getEthAddress": "api/v1/get-eth-address",
      "getLtcAddress": "api/v1/get-ltc-address",
      "validateAddress": "api/v1/validate-address",
      "saveWithdrawData": "api/v1/save-withdraw",
      "getLatestTxIds":  "api/v1/get-latest-txids",
      "verifyFiatAccount":  "api/v1/vfa",
      coins: {
        COINS_LIST: "api/v1/get-available-assets",
        FIAT_CURRENCIES: "api/v1/get-fiat-currs"
      },
      saveWithdraw: {
        btc: "api/v1/save-withdraw",
        steem: "api/v1/steem-sbd-save-withdraw",
        sbd: "api/v1/steem-sbd-save-withdraw",
        wls: "api/v1/wls-save-withdraw",
        eth: "api/v1/eth-save-withdraw",
        ltc: "api/v1/ltc-save-withdraw",
        usd: "api/v1/sfw",
        eur: "api/v1/sfw",
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