exports.getDepositTransactionRecord = function (res, txid) {
  return new Promise((resolve, reject) => {

    res.locals.connectionPool.getConnection(function(err, connection) {
      if (err) {
        return reject(err)
      }
      var queryCheckTxDataExists =
        "SELECT id, steem_trx_id, status " +
        "FROM `steem_sbd_deposit` " +
        "WHERE steem_trx_id=" + connection.escape(txid) + " ;";
      connection.query(queryCheckTxDataExists, (err, result, fields) => {
        connection.release();
        if (err) {
          return reject(err)
        }
        return resolve(result)
      });
    });
  });
};

exports.updateDepositTxStatus = function (res, steem_trx_id, date_updated, signatures,  status) {
  return new Promise((resolve, reject) => {
    res.locals.connectionPool.getConnection(function(err, connection) {
      if (err) {
        return reject(err)
      }

      var updateQuery = "UPDATE `steem_sbd_deposit` SET "
        + " `date_updated`=" + connection.escape(date_updated) + " , "
        + " `status`=" + connection.escape(status) + " , "
        + " `bts_signatures`=" + connection.escape(signatures) +" "
        + " WHERE steem_trx_id=" + connection.escape(steem_trx_id) + ";";
      //console.log("UPDATE TX QUERY: ",updateQuery);console.log("------------------------------------------");

      connection.query(updateQuery, (err, result, fields) => {
        connection.release();
        if (err) {
          return reject(err)
        }
        //console.log("updateTxStatus query");
        return resolve(result)
      });
    });
  })
};

exports.insertDepositTransaction = function (res, data) {
  return new Promise((resolve, reject) => {
    res.locals.connectionPool.getConnection(function(err, connection) {
      if (err) {
        return reject(err)
      }
      var insertQuery = "INSERT INTO `steem_sbd_deposit`(`steem_trx_id`, `_id`, `send_from`, `send_to`, `amount`, `asset`, `memo`, `steem_timestamp`, `date_received`, `status`) " +
        "VALUES ("
        + connection.escape(data.trx_id) + ", "
        + connection.escape(data._id) + ", "
        + connection.escape(data.send_from) + ", "
        + connection.escape(data.send_to) + ", "
        + connection.escape(data.amount) + ", "
        + connection.escape(data.asset) + ", "
        + connection.escape(data.memo) + ", "
        + connection.escape(data.steem_timestamp) + ", "
        + connection.escape(data.date_received) + ", "
        + connection.escape(data.status) + ");";

      connection.query(insertQuery, function(err, result, fields) {
        connection.release();
        if (err) {
          return reject(err)
        }
        //console.log("query result: ",result);
        return resolve(result)
      });
    });
  })
};

exports.insertInitWithdrawData = function (req, res, easydexCode, startTime) {
  return new Promise((resolve, reject) => {
    res.locals.connectionPool.getConnection(function(err, connection) {
      if (err) {
        return reject(err)
      }
      var insertQuery = "INSERT INTO `steem_sbd_withdrawal`(" +
        "`from_account`, " +
        "`to_account`, " +
        "`amount`, " +
        "`asset`, " +
        "`asset_address`, " +
        "`fee_asset_id`, " +
        "`fee_asset_amount`, " +
        "`memo`, " +
        "`easydex_code`, " +
        "`start_date`, " +
        "`status`) " +
        "VALUES ("
        + connection.escape(req.body.from_account) + ", "
        + connection.escape(req.body.to_account) + ", "
        + connection.escape(req.body.amount) + ", "
        + connection.escape(req.body.asset) + ", "
        + connection.escape(req.body.asset_address) + ", "
        + connection.escape(req.body.fee_asset_id) + ", "
        + connection.escape(req.body.fee_asset_amount) + ", "
        + connection.escape(req.body.memo) + ", "
        + connection.escape(easydexCode) + ", "
        + connection.escape(startTime) + ", 'initial');";

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
  })
};

exports.updateWithdrawStatus = function (res, easydexCode, status) {
  return new Promise((resolve, reject) => {
    res.locals.connectionPool.getConnection(function(err, connection) {
      if (err) {
        return reject(err)
      }
      var updateQuery = "UPDATE `steem_sbd_withdrawal` SET "
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
  })
};

exports.getWithdrawTxRecordByCode = function (res, code) {
  return new Promise((resolve, reject) => {
    res.locals.connectionPool.getConnection(function(err, connection) {
      if (err) {
        return reject(err)
      }
      var queryGetWithdrawTxRecord =
        "SELECT id, status " +
        "FROM `steem_sbd_withdrawal` " +
        "WHERE easydex_code=" + connection.escape(code) + ";";
      connection.query(queryGetWithdrawTxRecord, (err, result, fields) => {
        connection.release();
        if (err) {
          return reject(err)
        }
        return resolve(result)
      });
    });
  });
};

exports.updateWithdrawTx = function (res, data ) {
  return new Promise((resolve, reject) => {
    res.locals.connectionPool.getConnection(function(err, connection) {
      if (err) {
        return reject(err)
      }
      var bts_txid = data.bts_txid;
      var output_txid = data.output_txid;
      var status = data.status;
      var code = data.code;

      var strToUpdate = "";
      if(bts_txid){
        strToUpdate += " `bts_txid`=" + connection.escape(bts_txid) + " " ;
      }
      if(output_txid) {
        var escapedStr = connection.escape(output_txid);
        strToUpdate = strToUpdate !==""
          ? strToUpdate += " , `output_txid`=" + escapedStr+ " "
          : strToUpdate += " `output_txid`=" + escapedStr+ " "  ;
      }
      if(status) {
        var escapedStr = connection.escape(status);
        strToUpdate = strToUpdate !==""
          ? strToUpdate += " , `status`=" + escapedStr+ " "
          : strToUpdate += " `status`=" + escapedStr + " " ;
      }

      var updateQuery = "UPDATE `steem_sbd_withdrawal` SET " + strToUpdate + " WHERE `easydex_code`=" + connection.escape(code) + ";";
      //console.log("UPDATE WITHDRAW DATA DB QUERY: ",updateQuery);

      connection.query(updateQuery, (err, result, fields) => {
        connection.release();
        if (err) {
          return reject(err)
        }
        //console.log("update tx query result: ",result);
        return resolve(result)
      });
    });
  })
};
