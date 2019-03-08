
var constants = require('../constants');

exports.getLatestTxIds = function (res, operation, asset_id, account_id, walletType) {
  return new Promise((resolve, reject) => {

    res.locals.connectionPool.getConnection(function(err, connection) {
      if (err) {
        return reject(err)
      }
      var limit = getResultsLimit(walletType);
      var table = getAssetTable(operation, walletType);
      // console.log();
      var query =
        "SELECT id, asset, output_txid as txid, start_date as date, asset_address as address, status " +
        " FROM `" + table + "` " +
        " WHERE `asset`=" + connection.escape(asset_id) + " " +
        " AND `from_account`=" + connection.escape(account_id) + " " +
        " ORDER BY id DESC " +
        " LIMIT " + limit + "; ";
      //"WHERE hash_id=" + connection.escape(account_id) + " ;";
      // console.log("-----------------------------------------------");
      // console.log("SQL QUERY GET RECENT TX IDs: ")
      // console.log(query)
      // console.log("-----------------------------------------------");
      connection.query(query, (err, result, fields) => {
        connection.release();
        if (err) {
          return reject(err)
        }
        return resolve(result)
      })
    });

  })
};

function getAssetTable(op, walletType) {
  var table = constants.ASSETS.EASYDEX[walletType.toUpperCase()].TABLE[op];
  return table ? table : null;
}
function getResultsLimit(walletType) {
  var limit = constants.ASSETS.EASYDEX[walletType.toUpperCase()].GET_RECENT_TX_IDS_LIMIT;
  return limit ? limit : null;
}
/*
 SELECT
 *
 FROM
 `table`
 ORDER BY id DESC
 LIMIT 50;
* */