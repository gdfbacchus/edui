/*
 {
   'blockHash': HexBytes('0x2a69d51cd46f104fb3dc153a045a28b713694f16003eea7720fa2f18995ab622'),
   'value': 2000000000000000,
   'r': HexBytes('0x89caaf7ed4e566215fc03574420a3ea51ffa90520c096735274737c125aa1a2f'),
   'gasPrice': 12000000000,
   'nonce': 135,
   'input': '0x',
   'gas': 21000,
   'hash': HexBytes('0xfa765585d5fcbcf7414eda776bb93b797b29e97e12a2409d8044dc009d8ad2a4'),
   'from': '0xFd8186BeCea2a01FD48098fA5a86e504a0f8B269',
   'blockNumber': 5949469,
   'transactionIndex': 82,
   's': HexBytes('0x0361782ee16800f5c23def7cd5f303f02345af7212ee71cd27db593de8c8e9d9'),
   'to': '0xF514B79b080a1ee534cfAeE669F8f09069923622',
   'v': 27
 }
*/

exports.getDepositTransactionRecord = function (res, hashId) {
  return new Promise((resolve, reject) => {

    res.locals.connectionPool.getConnection(function(err, connection) {
      if (err) {
        return reject(err)
      }

      var queryCheckTxDataExists =
        "SELECT id, hash_id,  status " +
        "FROM `eth_deposit` " +
        "WHERE hash_id=" + connection.escape(hashId) + " ;";
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

exports.insertDepositTransaction = function (res, data) {
  return new Promise((resolve, reject) => {
    res.locals.connectionPool.getConnection(function(err, connection) {
      if (err) {
        return reject(err)
      }
      var insertQuery = "INSERT INTO `eth_deposit`(`hash_id`, `value`, `gas_price`, `gas`, `cumulative_gas_used`, `gas_used`, `send_from`, `send_to`, `date_received`, `status`, `eth_tx_status`) " +
        "VALUES ("
        + connection.escape(data.hash_id) + ", "
        + connection.escape(data.value) + ", "
        + connection.escape(data.gas_price) + ", "
        + connection.escape(data.gas) + ", "
        + connection.escape(data.cumulative_gas_used) + ", "
        + connection.escape(data.gas_used) + ", "
        + connection.escape(data.send_from) + ", "
        + connection.escape(data.send_to) + ", "
        + connection.escape(data.date_received) + ", "
        + connection.escape(data.status) + ", "
        + connection.escape(data.eth_tx_status) + ");";

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

exports.updateDepositTxStatus = function (res, hashId, date_updated, status) {
  return new Promise((resolve, reject) => {
    res.locals.connectionPool.getConnection(function(err, connection) {
      if (err) {
        return reject(err)
      }

      var updateQuery = "UPDATE `eth_deposit` SET "
        + " `date_updated`=" + connection.escape(date_updated) + " , "
        + " `status`=" + connection.escape(status) +" "
        + " WHERE hash_id=" + connection.escape(hashId) + ";";
      console.log("UPDATE TX QUERY: ",updateQuery);console.log("------------------------------------------");

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

exports.insertInitWithdrawData = function (req, res, easydexCode, startTime) {
  return new Promise((resolve, reject) => {
    res.locals.connectionPool.getConnection(function(err, connection) {
      if (err) {
        return reject(err)
      }
      var insertQuery = "INSERT INTO `eth_withdrawal`(" +
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
        + connection.escape(req.body.amount) + ", "
        + connection.escape(req.body.asset) + ", "
        + connection.escape(req.body.asset_address) + ", "
        + connection.escape(req.body.fee_asset_id) + ", "
        + connection.escape(req.body.fee_asset_amount) + ", "
        + connection.escape(req.body.minerFee) + ", "
        + connection.escape(req.body.memo) + ", "
        + connection.escape(easydexCode) + ", "
        + connection.escape(startTime) + ", "
        + "'initial');";

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
      var updateQuery = "UPDATE `eth_withdrawal` SET "
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
        "FROM `eth_withdrawal` " +
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
      var hash_id = data.hash_id;
      var status = data.status;
      var code = data.code;

      var strToUpdate = "";
      if(bts_txid){
        strToUpdate += " `bts_txid`=" + connection.escape(bts_txid)+ " " ;
      }
      if(output_txid) {
        var escapedStr = connection.escape(output_txid);
        strToUpdate = strToUpdate !==""
          ? strToUpdate += " , `output_txid`=" + escapedStr+ " "
          : strToUpdate += " `output_txid`=" + escapedStr + " "  ;
      }
      if(status) {
        var escapedStr = connection.escape(status);
        strToUpdate = strToUpdate !==""
          ? strToUpdate += " , `status`=" + escapedStr + " "
          : strToUpdate += " `status`=" + escapedStr + " " ;
      }
      if(hash_id) {
        var escapedStr = connection.escape(hash_id);
        strToUpdate = strToUpdate !==""
          ? strToUpdate += " , `hash_id`=" + escapedStr + " "
          : strToUpdate += " `hash_id`=" + escapedStr + " " ;

        strToUpdate = strToUpdate !==""
          ? strToUpdate += " , `output_txid`=" + escapedStr + " "
          : strToUpdate += " `output_txid`=" + escapedStr + " " ;
      }

      var updateQuery = "UPDATE `eth_withdrawal` SET " + strToUpdate + " WHERE `easydex_code`=" + connection.escape(code) + ";";
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
