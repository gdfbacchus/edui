//var zerorpc = require("zerorpc");
//5.189.130.184:3007/api/v1/test-bts-zerorpc
var mainConstants = require('../../../common/constants');
var options = {

};

var zerorpc = require("zerorpc");
var zerorpc_conn = new zerorpc.Client();


var testZerorpc = (req, res, next) => {
  console.log("Connecting...");

  //var pyBtsClient = res.locals.zerorpc_connection;
  var pyBtsClient = zerorpc_conn;
  //console.log("client: ",pyBtsClient);

  // console.log("1 client: ",pyBtsClient);
  pyBtsClient.connect("tcp://127.0.0.1:4242");

  pyBtsClient.on("error", function(error) {
    console.error("RPC client error:", error);
  });
  // console.log("2 client: ",pyBtsClient);
  var to = 'patelincho812';
  // pyBtsClient.invoke("get_asset", "BTS", '{"id": 17}', function(error, response, more) {

  // pyBtsClient.invoke("get_account", 'patelincho812', function(error1, resp1, more1) {
  //   if(error1) {
  //     console.error(error1);
  //     res.send(JSON.stringify({"status": 500, "error": error1, "response":""}));
  //   } else {
  //     console.log("RESPONSE: ", resp1);
  //     res.send(JSON.stringify({"status": 200, "error": null, "response": "success"}))
  //   }
  //   if(!more1) {
  //     console.log("Done.");
  //   }
  // });

//   pyBtsClient.invoke("ping", function(error1, resp1, more1) {
//     console.log("test ping");
//     if(error1) {
//       console.error(error1);
//       res.send(JSON.stringify({"status": 500, "error": error1, "response":""}));
//     } else {
//       console.log("RESPONSE: ", resp1);
//       res.send(JSON.stringify({"status": 200, "error": null, "response": "success"}))
//     }
//     if(!more1) {
//       console.log("Done.");
//     }
//   });

  var errMsg = "";
  var status = "";
  console.log("Test SCRIPT BODY: ",req.body);
  pyBtsClient.invoke("get_account", 'patelincho812', function(error1, resp1, more1) {
    if(error1) {
      console.error(error1);
      status = "failed";
      errMsg = "Py (get_account) failed.";
      console.error("ERROR1:: ",errMsg);
      //res.send(JSON.stringify({"status": 500, "error": error1, "response":error1}));
      res.status(500).send(JSON.stringify({"status": 500, "error": error1, "response":error1}));
    } else {
      console.log("RESPONSE 1: ", resp1);

      var toAccountId = JSON.parse(JSON.stringify(resp1)).id;
      var txJson = JSON.stringify(buildTxJson(toAccountId, 1));

      console.log("TEST JSON: ", txJson);

      pyBtsClient.invoke("send_transaction", txJson, function (error, response, more) {

        var parsedResp = null;

        if (error) {
          status = "failed";
          console.error("ERROR2:: ", error);
        }
        console.log("RESPONSE 2 send_transaction: ", response);
        if(response){
          parsedResp = JSON.parse(JSON.stringify(response));
        } else {
          console.log("RESPONSE 2 send_transaction is undefined: ", response);
        }

        if (parsedResp === true) {
          status = "successful";
        } else {
          status = "failed";
        }

        console.log("status: ",status);
      });
      res.send(JSON.stringify({"status": 200, "error": null, "response": "Transaction successful: " + status }))
    }
    if(!more1) {
      console.log("Done.");
    }
  });





};


function buildTxJson(to, amount) {
  var json = {
    "fee": {
      "amount": 0,
      "asset_id": mainConstants.ASSETS.MAIN.ID
    },
    "from": mainConstants.MAIN_ACCOUNT.ID,
    "to": to,
    "amount": {
      "amount": amount,
      "asset_id": mainConstants.ASSETS.EASYDEX.BTC.ID
    },
    "extensions": []
  };
  return json;

}
module.exports.testZerorpc = testZerorpc;

//TRANSACTION EXAMPLE
// {
//   "fee": { "amount": 0, "asset_id": "1.3.0" },
//   "from": "1.2.459605",
//   "to": "1.2.196550",
//   "amount": { "amount": 1, "asset_id": "1.3.3059" },
//   "extensions": []
// }