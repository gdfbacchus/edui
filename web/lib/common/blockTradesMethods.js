import ls from "./localStorage";
import {blockTradesAPIs} from "api/apiConfig";
const blockTradesStorage = new ls("");
import endpoints from 'assets/constants/endpoints';


// export function fetchCoins(url = (blockTradesAPIs.BASE_OL + blockTradesAPIs.COINS_LIST)) {
//     return fetch(url).then(reply => reply.json().then(result => {
//         return result;
//     })).catch(err => {
//         console.log("error fetching blocktrades list of coins", err, url);
//     });
// }
export function fetchCoins(url = (endpoints.NODE_JS_API.SERVER + endpoints.NODE_JS_API.URLS.coins.COINS_LIST)) {
  var op = {
    method:"POST",
    headers: new Headers( { "Accept": "application/json", "Content-Type":"application/json" } ),
    body: "{}"
  };
  return fetch(url, op).then(reply => reply.json().then(result => {
    //console.log("RESULT: ",result);
    var parsedResp = null;
    try {
      parsedResp = JSON.parse(result.response);
    } catch (err) {
      console.log("CODE RESPONSE PARSE ERR: ",err);
    }
    // return result;
    //console.log("RESULT: ",parsedResp);
    var arr = [parsedResp];
    return parsedResp;
  })).catch(err => {
    console.log("error fetching blocktrades list of coins", err, url);
  });
}
//TODO USE EASYDEX URL
export function fetchBridgeCoins(baseurl = (blockTradesAPIs.BASE)) {
    let url = baseurl + blockTradesAPIs.TRADING_PAIRS;
    return fetch(url, {method: "get", headers: new Headers({"Accept": "application/json"})}).then(reply => reply.json().then(result => {
        return result;
    })).catch(err => {
        console.log("error fetching blocktrades list of coins", err, url);
    });
}

export function getDepositLimit(inputCoin, outputCoin, url = (blockTradesAPIs.BASE + blockTradesAPIs.DEPOSIT_LIMIT)) {
    return fetch(url + "?inputCoinType=" + encodeURIComponent(inputCoin) + "&outputCoinType=" + encodeURIComponent(outputCoin),
        {method: "get", headers: new Headers({"Accept": "application/json"})}).then(reply => reply.json().then(result => {
        return result;
    })).catch(err => {
        console.log("error fetching deposit limit of", inputCoin, outputCoin, err);
    });
}

export function estimateOutput(inputAmount, inputCoin, outputCoin, url = (blockTradesAPIs.BASE + blockTradesAPIs.ESTIMATE_OUTPUT)) {
    return fetch(url + "?inputAmount=" + encodeURIComponent(inputAmount) +"&inputCoinType=" + encodeURIComponent(inputCoin) + "&outputCoinType=" + encodeURIComponent(outputCoin),
         {method: "get", headers: new Headers({"Accept": "application/json"})}).then(reply => reply.json().then(result => {
        return result;
    })).catch(err => {
        console.log("error fetching deposit limit of", inputCoin, outputCoin, err);
    });
}

export function estimateInput(outputAmount, inputCoin, outputCoin, url = (blockTradesAPIs.BASE + blockTradesAPIs.ESTIMATE_INPUT)) {
    return fetch(url + "?outputAmount=" + encodeURIComponent(outputAmount) +"&inputCoinType=" + encodeURIComponent(inputCoin) + "&outputCoinType=" + encodeURIComponent(outputCoin), {
        method: "get", headers: new Headers({"Accept": "application/json"})}).then(reply => reply.json().then(result => {
        return result;
    })).catch(err => {
        console.log("error fetching deposit limit of", inputCoin, outputCoin, err);
    });
}
//TODO USE EASYDEX URL
export function getActiveWallets(url = (blockTradesAPIs.BASE_OL + blockTradesAPIs.ACTIVE_WALLETS)) {
    return fetch(url).then(reply => reply.json().then(result => {
        return result;
    })).catch(err => {
        console.log("error fetching blocktrades active wallets", err, url);
    });
}

export function getDepositAddress({coin, account, stateCallback}) {

    let body = {
        coin,
        account
    };

    let body_string = JSON.stringify(body);

    fetch( blockTradesAPIs.BASE_OL + "/simple-api/get-last-address", {
        method:"POST",
        headers: new Headers( { "Accept": "application/json", "Content-Type":"application/json" } ),
        body: body_string
    }).then(
        data => {
            data.json()
        .then( json => {
            let address = {"address": json.address, "memo": json.memo || null, error: json.error || null, loading: false};
            if (stateCallback) stateCallback(address);
        }, error => {
             console.log( "error: ",error  );
            if (stateCallback) stateCallback({"address": error.message, "memo": null});
        });
    }, error => {
         console.log( "error: ",error  );
        if (stateCallback) stateCallback({"address": error.message, "memo": null});

    }).catch(err => {
        console.log("fetch error:", err);
    });
}

function getAddressEndpoint(coin) {
  console.log("coin: ", coin);
  switch(coin) {
    case "BTC": case "EASYDEX.BTC":
      return endpoints.NODE_JS_API.URLS.getBtcAddress;
    case "ETH": case "EASYDEX.ETH":
      return endpoints.NODE_JS_API.URLS.getEthAddress;
    case "LTC": case "EASYDEX.LTC":
      return endpoints.NODE_JS_API.URLS.getLtcAddress;
    default:
      return endpoints.URLS.getBtcAddress;
  }
}

function getAddressAssetName(coin) {
  console.log("coin: ", coin);
  switch(coin) {
    case "EASYDEX.BTC":case "BTC":
      return "BTC";
    case "EASYDEX.ETH":case "ETH":
      return "ETH";
    case "EASYDEX.LTC":case "LTC":
    return "LTC";
    default:
      return "";
  }
}

export function getEasyDexDepositAddress({coin, account, stateCallback}) {
  let coinEndPoint = getAddressEndpoint(coin);
  let getAddrAddress = endpoints.NODE_JS_API.SERVER + coinEndPoint;
  let body = {
    "asset": getAddressAssetName(coin),
    "username": account
  };
  console.log("body request params: ",body);
  let body_string = JSON.stringify(body);
  console.log("body request params: ",body_string);
  console.log("getAddrAddress: ",getAddrAddress);

  fetch( getAddrAddress,{
    method:"POST",
    headers: new Headers( { "Accept": "application/json", "Content-Type":"application/json" } ),
    body: body_string,
    //mode: "no-cors"
  }).then(
    data => {
      //console.log("DATA: ", data)
      data.json()
        .then( json => {
          //console.log("json: ", json);
          //console.log("address: ", json.response.address);
          //console.log("asset: ", json.response.asset);

          let address = {"address": json.response.address, error: json.response.error || null, loading: false};
          if (stateCallback) {
            stateCallback(address)
          };
        }, error => {
          console.log( "error: ",error  );
          if (stateCallback) stateCallback({"address": error.message});
        })
    }, error => {
      console.log( "error: ",error  );
      if (stateCallback) stateCallback({"address": error.message});

    }).catch(err => {
    console.log("fetch error:", err);
  });
}

export function saveWithdrawData(data, callback) {
  const { from_account, to_account, amount2, asset2, memo, minerFee, fee_asset_id, fee_asset_amount, asset_address, output_coin_type } = data;
  let endPoint = endpoints.NODE_JS_API.URLS.saveWithdraw[output_coin_type];

  //console.log("output_coin_type: ",output_coin_type);
  //console.log("endPoint: ",endPoint);

  let apiEndpoint = endpoints.NODE_JS_API.SERVER + endPoint;
  let body = {
    from_account,
    to_account,
    amount: amount2,
    asset: asset2,
    memo,
    minerFee,
    fee_asset_id,
    fee_asset_amount,
    asset_address
  };
  //console.log("[saveWithdrawData] body object: ",body);
  //console.log("apiEndpoint: ",apiEndpoint);
  let body_string = JSON.stringify(body);
  //console.log("body request params: ",body_string);

  fetch( apiEndpoint,{
    method:"POST",
    headers: new Headers( { "Accept": "application/json", "Content-Type":"application/json" } ),
    body: body_string,
    //mode: "no-cors"
  }).then(
    data => {
      //console.log("RESPONSE DATA: ", data)
      data.json()
        .then( json => {
          //console.log("json: ", json);
          //console.log("json.response: ", json.response);
          var parsedResp = null;
          try {
            parsedResp = JSON.parse(json.response);
          } catch (err) {
            console.log("CODE RESPONSE PARSE ERR: ",err);
          }
          let jsonResponse = {"response": parsedResp, error: json.error || null, loading: false};
          if (callback) {
            callback(jsonResponse);
          }
        }, error => {
          console.log( "error: ",error  );
          if (callback) callback({"response": error.message});
        })
    }, error => {
      console.log( "error: ",error  );
      if (callback) callback({"response": error.message});

    }).catch(err => {
    console.log("fetch error:", err);
  });
}

export function saveFiatWithdrawData(data, callback) {
  const {
    from_account,
    to_account,
    amount,
    asset,
    fee_asset_id,
    fee_asset_amount_sats,
    trx_id,
    trx_block_num,
    output_coin_type
  } = data;
  let endPoint = endpoints.NODE_JS_API.URLS.saveWithdraw[output_coin_type.toLowerCase()];

  // console.log("output_coin_type: ",output_coin_type);
  // console.log("Fiat withdraw endPoint: ",endPoint);

  let apiEndpoint = endpoints.NODE_JS_API.SERVER + endPoint;
  let body = {
    from_account,
    to_account,
    amount: amount,
    asset: asset,
    fee_asset_id,
    fee_asset_amount_sats,
    trx_id,
    trx_block_num
  };
  //console.log("[saveWithdrawData] body object: ",body);
  //console.log("apiEndpoint: ",apiEndpoint);
  let body_string = JSON.stringify(body);
  //console.log("body request params: ",body_string);

  fetch( apiEndpoint,{
    method:"POST",
    headers: new Headers( { "Accept": "application/json", "Content-Type":"application/json" } ),
    body: body_string,
    //mode: "no-cors"
  }).then(
    data => {
      //console.log("RESPONSE DATA: ", data)
      data.json()
        .then( json => {
          //SUCCESS
          //console.log("json: ", json);
          //console.log("response: ",json.response);
          if (callback) callback();
        }, error => {
          console.log( "error: ",error  );
        })
    }, error => {
      console.log( "error: ",error  );
      if (callback) callback({"response": error.message});

    }).catch(err => {
    console.log("fetch error:", err);
  });
}

export function requestDepositAddress({inputCoinType, outputCoinType, outputAddress, url = blockTradesAPIs.BASE_OL, stateCallback}) {
    let body = {
        inputCoinType,
        outputCoinType,
        outputAddress
    };

    let body_string = JSON.stringify(body);

    fetch( url + "/simple-api/initiate-trade", {
        method:"post",
        headers: new Headers( { "Accept": "application/json", "Content-Type":"application/json" } ),
        body: body_string
    }).then( reply => { reply.json()
        .then( json => {
            let address = {"address": json.inputAddress || "unknown", "memo": json.inputMemo, error: json.error || null, loading: false};
            if (stateCallback) stateCallback(address);
        }, error => {
            // console.log( "error: ",error  );
            if (stateCallback) stateCallback({"address": "unknown", "memo": null});
        });
    }, error => {
        // console.log( "error: ",error  );
        if (stateCallback) stateCallback({"address": "unknown", "memo": null});
    }).catch(err => {
        console.log("fetch error:", err);
    });
}

export function getBackedCoins({allCoins, tradingPairs, backer}) {
    let coins_by_type = {};
    allCoins.forEach(coin_type => coins_by_type[coin_type.coinType] = coin_type);

    let allowed_outputs_by_input = {};
    tradingPairs.forEach(pair => {
        if (!allowed_outputs_by_input[pair.inputCoinType])
            allowed_outputs_by_input[pair.inputCoinType] = {};
        allowed_outputs_by_input[pair.inputCoinType][pair.outputCoinType] = true;
    });

    let blocktradesBackedCoins = [];
    allCoins.forEach(coin_type => {
        if (coin_type.walletSymbol.startsWith(backer + ".") && coin_type.backingCoinType && coins_by_type[coin_type.backingCoinType]) {
            let isDepositAllowed = allowed_outputs_by_input[coin_type.backingCoinType] && allowed_outputs_by_input[coin_type.backingCoinType][coin_type.coinType];
            let isWithdrawalAllowed = allowed_outputs_by_input[coin_type.coinType] && allowed_outputs_by_input[coin_type.coinType][coin_type.backingCoinType];

            blocktradesBackedCoins.push({
                name: coins_by_type[coin_type.backingCoinType].name,
                intermediateAccount: coins_by_type[coin_type.backingCoinType].intermediateAccount,
                gateFee: coins_by_type[coin_type.backingCoinType].gateFee,
                walletType: coins_by_type[coin_type.backingCoinType].walletType,
                backingCoinType: coins_by_type[coin_type.backingCoinType].walletSymbol,
                symbol: coin_type.walletSymbol,
                supportsMemos: coins_by_type[coin_type.backingCoinType].supportsOutputMemos,
                depositAllowed: isDepositAllowed,
                withdrawalAllowed: isWithdrawalAllowed
            });
        }});
    return blocktradesBackedCoins;
}
//OL
export function validateAddress({url = blockTradesAPIs.BASE_OL, walletType, newAddress}) {
    if (!newAddress) return new Promise((res) => res());
    return fetch(
        url + "/wallets/" + walletType + "/address-validator?address=" + encodeURIComponent(newAddress),
        {
            method: "get",
            headers: new Headers({"Accept": "application/json"})
        }).then(reply => reply.json().then( json => json.isValid))
        .catch(err => {
            console.log("validate error:", err);
        });
}
//EasyDex
export function validateAddressED({url = endpoints.NODE_JS_API.URLS.validateAddress, walletType, newAddress}) {
  if (!newAddress) return new Promise((res) => res());

  let _url = url + "/wallets/" + walletType + "/address-validator?address=" + encodeURIComponent(newAddress);
  //console.log("validate address ENCODED ADDRESS: ", encodeURIComponent(newAddress));
  //console.log("validate address URL: ", _url);
  //console.log("validate address walletType: ", walletType);
  //console.log("validate address newAddress: ", newAddress);
  return fetch(
    _url,
    {
      method: "get",
      headers: new Headers({"Accept": "application/json"})
    }).then(reply => reply.json().then( json => json.response.isValid) )
    .catch(err => {
      console.log("Address validation error:", err);
    });
}

let _conversionCache = {};
export function getConversionJson(inputs) {
    const { input_coin_type, output_coin_type, url, account_name } = inputs;
    if (!input_coin_type || !output_coin_type) return Promise.reject();
    const body = JSON.stringify({
        inputCoinType: input_coin_type,
        outputCoinType: output_coin_type,
        outputAddress: account_name,
        inputMemo: "blocktrades conversion: " + input_coin_type + "to" + output_coin_type
    });

    const _cacheString = url + input_coin_type + output_coin_type + account_name;
    return new Promise((resolve, reject) => {
        if (_conversionCache[_cacheString]) return resolve(_conversionCache[_cacheString]);
        fetch(url + "/simple-api/initiate-trade", {
            method:"post",
            headers: new Headers({"Accept": "application/json", "Content-Type": "application/json"}),
            body: body
        }).then(reply => { reply.json()
            .then( json => {
                _conversionCache[_cacheString] = json;
                resolve(json);
            }, reject)
            .catch(reject);
        }).catch(reject);
    });
}

export function getLatestTxIds(coin_id, account_id, op, walletType, callback){
  let endPoint = endpoints.NODE_JS_API.URLS.getLatestTxIds;
  let apiEndpoint = endpoints.NODE_JS_API.SERVER + endPoint;
  let body = {
    op:op,
    asset: coin_id,
    account: account_id,
    walletType: walletType
  };
  console.log("body object: ",body);
  console.log("apiEndpoint: ",apiEndpoint);
  let body_string = JSON.stringify(body);


  fetch( apiEndpoint,{
    method:"POST",
    headers: new Headers( { "Accept": "application/json", "Content-Type":"application/json" } ),
    body: body_string,
    //mode: "no-cors"
  }).then(
    data => {
      console.log("GET RECENT TX IDs RESPONSE: ", data);
      data.json()
        .then( json => {
          var parsedResp = json.response;
          console.log("json: ", json);
          console.log("json.response: ", parsedResp);

          let jsonResponse = {"response": parsedResp, error: json.error || null, loading: false};
          if (callback) {
            callback(jsonResponse);
          }
        }, error => {
          console.log( "error: ",error  );
          if (callback) callback({"response": error.message});
        })
    }, error => {
      console.log( "error: ",error  );
      if (callback) callback({"response": error.message});

    }).catch(err => {
    console.log("fetch error:", err);
  });
}

function hasWithdrawalAddress(wallet) {
    return blockTradesStorage.has(`history_address_${wallet}`);
}

function setWithdrawalAddresses({wallet, addresses}) {
    blockTradesStorage.set(`history_address_${wallet}`, addresses);
}

function getWithdrawalAddresses(wallet) {
    return blockTradesStorage.get(`history_address_${wallet}`, []);
}

function setLastWithdrawalAddress({wallet, address}) {
    blockTradesStorage.set(`history_address_last_${wallet}`, address);
}

function getLastWithdrawalAddress(wallet) {
    return blockTradesStorage.get(`history_address_last_${wallet}`, "");
}

export const WithdrawAddresses = {
    has: hasWithdrawalAddress,
    set: setWithdrawalAddresses,
    get: getWithdrawalAddresses,
    setLast: setLastWithdrawalAddress,
    getLast: getLastWithdrawalAddress
}
