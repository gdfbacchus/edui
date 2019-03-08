exports.getAvailableVerifiedCurrenciesByAccount = function (req, res) {
  var username = req.body.username;

  return new Promise((resolve, reject) => {
    res.locals.connectionPool.getConnection(function(err, connection) {
      if (err) {
        return reject(err)
      }
      // console.log("GET AVAILABLE VERIFIED FIAT CURRENCIES----------------------------");
      // console.log("Not Escaped username: ", username);
      // console.log("Escaped username: ", connection.escape(username));
      // console.log("END GET AVAILABLE VERIFIED FIAT CURRENCIES----------------------------");

      var query =
        "SELECT c.symbol, c.bts_id, c.name, c.min_withdraw, c.fee_percentage, c.bank_tax, c.maxWithdrawAmountPerTx " +
        "FROM fiat_withdraw_verified_users u " +
        "JOIN fiat_verified_users_currencies uc " +
          "ON(u.id=uc.user_id) " +
        "JOIN fiat_currencies c " +
          "ON(uc.currency_id=c.id) " +
        "WHERE u.account_name = " + connection.escape(username) + " " +
          "AND c.isAvailable = 'yes' " +
          "AND uc.active = 'yes' " +
          "AND u.verified = 'yes' ; ";

      //console.log("QUERY: ", query);
      connection.query(query, (err, result, fields) => {
        connection.release();
        if (err) {
          return reject(err)
        }
        return resolve(result)
      });
    });
  });
};

/*
 SELECT c.symbol, c.bts_id, c.name, c.min_withdraw, c.fee_percentage, c.bank_tax
 FROM fiat_withdraw_verified_users u
 JOIN fiat_verified_users_currencies uc
 ON(u.id=uc.user_id)
 JOIN fiat_currencies c
 ON(uc.currency_id=c.id)
 WHERE u.account_name = 'vasko-1-test30'
 AND c.isAvailable = 'true'
 AND uc.active = 'yes'
 AND u.verified = 'yes'
 */

exports.insertFiatWithdrawData = function (req, res, withdrawDate) {
  return new Promise((resolve, reject) => {
    res.locals.connectionPool.getConnection(function(err, connection) {
      if (err) {
        return reject(err)
      }

      var insertQuery = "INSERT INTO `fiat_withdrawal`(" +
        "`from_account`, " +
        "`to_account`, " +
        "`amount`, " +
        "`asset`, " +
        "`fee_asset_id`, " +
        "`fee_asset_amount_sats`, " +
        "`bts_trx_id`, " +
        "`bts_trx_block_num`, " +
        "`withdraw_date`, " +
        "`status`) " +
        "VALUES ("
        + connection.escape(req.body.from_account) + ", "
        + connection.escape(req.body.to_account) + ", "
        + connection.escape(req.body.amount) + ", "
        + connection.escape(req.body.asset) + ", "
        + connection.escape(req.body.fee_asset_id) + ", "
        + connection.escape(req.body.fee_asset_amount_sats) + ", "
        + connection.escape(req.body.trx_id) + ", "
        + connection.escape(req.body.trx_block_num) + ", '"
        + withdrawDate + "', "
        + "'sent');";

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

exports.getExistingWithdrawData = function (req, res) {
  var txId = req.body.trx_id;
  var trx_block_num = req.body.trx_block_num;

  return new Promise((resolve, reject) => {
    res.locals.connectionPool.getConnection(function(err, connection) {
      if (err) {
        return reject(err)
      }

      var query =
        "SELECT * " +
        "FROM fiat_withdrawal " +
        "WHERE fiat_withdrawal.bts_trx_id = " + connection.escape(txId) +
        " AND fiat_withdrawal.bts_trx_block_num = " + connection.escape(trx_block_num) + " ;";
      //console.log("QUERY: ", query);

      connection.query(query, (err, result, fields) => {
        connection.release();
        if (err) {
          return reject(err)
        }
        return resolve(result)
      });
    });
  });
};