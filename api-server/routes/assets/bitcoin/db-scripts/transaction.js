exports.getTransactionRecord = function (res, req) {

  return new Promise((resolve, reject) => {
    res.locals.connectionPool.getConnection(function(err, connection) {
      if (err) {
        return reject(err)
      }
      var txId = req.query.tx;
      var queryCheckTxDataExists = "SELECT txid, num_of_confirmations FROM transaction where txid=" + connection.escape(txId) + ";";

      connection.query(queryCheckTxDataExists, (err, result, fields) => {
        connection.release();
        if (err) {
          return reject(err)
        }
        //should parse result like that: var resJSONData = JSON.parse(JSON.stringify(result));
        return resolve(result)
      });
    });
  });
};

exports.getAddressRecord = function (res, address) {
  return new Promise((resolve, reject) => {
    res.locals.connectionPool.getConnection(function(err, connection) {
      if (err) {
        return reject(err)
      }
      var queryCheckAddressExists =
        "SELECT id, address, account_name, asset_id " +
        "FROM `wallet_address` " +
        "WHERE address = " + connection.escape(address) + " ;";
      connection.query(queryCheckAddressExists, (err, result, fields) => {
        connection.release();
        if (err) {
          return reject(err)
        }
        //should parse result like that: var resJSONData = JSON.parse(JSON.stringify(result));
        return resolve(result)
      });
    });
  });
};

exports.insertTransaction = function (res, req, txData, type, currentUtcTime) {
  return new Promise((resolve, reject) => {
    res.locals.connectionPool.getConnection(function(err, connection) {
      if (err) {
        return reject(err)
      }
      var txId = req.query.tx;
      // 	id 	txid 	received_by_address 	amount 	num_of_confirmations 	account_name
      var insertQuery = "INSERT INTO `transaction`(`txid`, `received_by_address`, `amount`, `num_of_confirmations`, `account_name`, `type`, `start_date`) " +
        "VALUES ("
        + connection.escape(txData.txid) + ", "
        + connection.escape(txData.details[0].address) + ", "
        + connection.escape(txData.details[0].amount) + ", "
        + connection.escape(txData.confirmations) + ", "
        + connection.escape(txData.details[0].account) + ", " + connection.escape(type) + ", " + connection.escape(currentUtcTime) + ");";

      connection.query(insertQuery, function(err, result, fields) {
        connection.release();
        if (err) {
          return reject(err)
        }
        //console.log("query result: ",result);
        return resolve(result)
      });
    });
  });
};

// exports.updateTransaction = function (res, req, txData) {
//   return new Promise((resolve, reject) => {
//     res.locals.connectionPool.getConnection(function(err, connection) {
//       if (err) {
//         return reject(err)
//       }
//       var updateQuery = "UPDATE `transaction` SET "
//         + "`txid`=" + connection.escape(txData.txid)
//         + ", `received_by_address`=" + connection.escape(txData.details[0].address)
//         + ", `amount`=" + connection.escape(txData.detail.amount)
//         + ", `num_of_confirmations`=" + connection.escape(txData.confirmations)
//         + " WHERE `txid`='" + connection.escape(txData.txid) + "';";
//
//       connection.query(updateQuery, (err, result, fields) => {
//         connection.release();
//         if (err) {
//           return reject(err)
//         }
//         //console.log("update tx query result: ",result);
//         return resolve(result)
//       });
//     });
//   });
// };

exports.getTransactionOwnerData = function (res, address, txid) {
  return new Promise((resolve, reject) => {
    res.locals.connectionPool.getConnection(function(err, connection) {
      if (err) {
        return reject(err)
      }
      var queryUserTxData =
        "SELECT t.txid, t.received_by_address as address, t.amount, wa.account_name as username, " +
          "a.asset_name as asset, a.easydex_asset_name as e_asset, a.easydex_bts_object as e_bts_object " +
        "FROM transaction t " +
        "JOIN wallet_address wa " +
        "ON(t.received_by_address=wa.address) " +
        "JOIN asset a " +
        "ON(wa.asset_id=a.id) " +
        "WHERE t.received_by_address=" + connection.escape(address) + " " +
        "AND wa.address = " + connection.escape(address) + " " +
        "AND t.txid = " + connection.escape(txid) + ";";
      //console.log("queryUserTxData: ",queryUserTxData);
      connection.query(queryUserTxData, (err, result, fields) => {
        connection.release();
        if (err) {
          return reject(err);
        }
        return resolve(result);
      });
    });
  });
};

exports.updateTxConfirmations = function (res,  txid, confirmations, status, currDate) {
  return new Promise((resolve, reject) => {
    res.locals.connectionPool.getConnection(function(err, connection) {
      if (err) {
        return reject(err)
      }
      var updateQuery = "UPDATE `transaction` SET "
        + " `num_of_confirmations`=" + connection.escape(confirmations)
        + " , `status_of_tx`=" + connection.escape(status) +" , `end_date`= " + connection.escape(currDate) +
        + " WHERE `txid`=" + connection.escape(txid) + ";";

      //console.log("UPDATE TX QUERY: ",updateQuery);

      connection.query(updateQuery, (err, result, fields) => {
        connection.release();
        if (err) {
          return reject(err)
        }
        //console.log("updateTxConfirmations query");
        return resolve(result)
      });
    });
  });
};

exports.insertInitWithdrawData = function (req, res, amount, easydexCode, startTime) {
  return new Promise((resolve, reject) => {
    res.locals.connectionPool.getConnection(function(err, connection) {
      if (err) {
        return reject(err)
      }
      var insertQuery = "INSERT INTO `withdrawal`(" +
        "`from_account`, " +
        "`to_account`, " +
        "`amount`, " +
        "`asset`, " +
        "`asset_address`, " +
        "`fee_asset_id`, " +
        "`fee_asset_amount`, " +
        "`minerFee`, " +
        "`memo`, " +
        "`easydex_code`, " +
        "`start_date`, " +
        "`status`) " +
        "VALUES ("
        + connection.escape(req.body.from_account) + ", "
        + connection.escape(req.body.to_account) + ", "
        + connection.escape(amount) + ", "
        + connection.escape(req.body.asset) + ", "
        + connection.escape(req.body.asset_address) + ", "
        + connection.escape(req.body.fee_asset_id) + ", "
        + connection.escape(req.body.fee_asset_amount) + ", "
        + connection.escape(req.body.minerFee) + ", "
        + connection.escape(req.body.memo) + ", "
        + connection.escape(easydexCode) + ", "
        + connection.escape(startTime) + ", '"
        + "initial');";

      //console.log("DB insertion query: ",insertQuery);
      connection.query(insertQuery, function(err, result, fields) {
        connection.release();
        if (err) {
          return reject(err)
        }
        //console.log("query result: ",result);
        return resolve(result)
      });
    });
  });
};

exports.getInitialWithdrawData = function(res, json) {
  return new Promise((resolve, reject) => {
    res.locals.connectionPool.getConnection(function(err, connection) {
      if (err) {
        return reject(err)
      }
      var queryInitWithdrawData =
        "SELECT * " +
        "FROM withdrawal " +
        "WHERE easydex_code =" + connection.escape(json.easydex_code) + ";";

      connection.query(queryInitWithdrawData, (err, result, fields) => {
        connection.release();
        if (err) {
          return reject(err);
        }
        return resolve(result);
      });
    });
  });
};

exports.updateWithdrawData = function (res, easydexCode, btsTxid,  btcTxid, status) {
  return new Promise((resolve, reject) => {
    res.locals.connectionPool.getConnection(function(err, connection) {
      if (err) {
        return reject(err)
      }
      var updateQuery = "UPDATE `withdrawal` SET "
        + " `bts_txid`=" + connection.escape(btsTxid)
        + " , `output_txid`=" + connection.escape(btcTxid)
        + " , `status`=" + connection.escape(status)
        + " WHERE `easydex_code`=" + connection.escape(easydexCode) + ";";

      //console.log("UPDATE WITHDRAW DATA QUERY: ",updateQuery);

      connection.query(updateQuery, (err, result, fields) => {
        connection.release();
        if (err) {
          return reject(err)
        }
        return resolve(result)
      });
    });
  });
};

exports.updateWithdrawStatus = function (res, easydexCode, status) {
  return new Promise((resolve, reject) => {
    res.locals.connectionPool.getConnection(function(err, connection) {
      if (err) {
        return reject(err)
      }
      var updateQuery = "UPDATE `withdrawal` SET "
        + " `status`=" + connection.escape(status)
        + " WHERE `easydex_code`=" + connection.escape(easydexCode) + ";";

      //console.log("UPDATE WITHDRAW DATA QUERY: ",updateQuery);
      connection.query(updateQuery, (err, result, fields) => {
        connection.release();
        if (err) {
          return reject(err)
        }
        return resolve(result)
      });
    });
  });
};