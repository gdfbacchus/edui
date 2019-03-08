exports.getAvailableAssets = function (res) {
  return new Promise((resolve, reject) => {

    res.locals.connectionPool.getConnection(function(err, connection) {
      if (err) {
        return reject(err)
      }

      var query =
        "SELECT a_s.name, a_s.intermediateAccount, a_s.addressSendTo, a_s.gateFee, a_s.walletType, a_s.backingCoinType, " +
        "a_s.symbol, a_s.supportsMemos, a_s.addressType, a_s.isAvailable, a_s.minimalDeposit, a_s.minimalWithdraw, " +
        "a_s.hasFee, a_s.feeType, a_s.displayMemoField, a_s.pointPrecision, a_s.disableGateFeeField, " +
        "a_s.validateAddress, a_s.unitParts, a.easydex_bts_object " +
        " FROM `asset_settings` a_s " +
        " JOIN `asset` a " +
        " ON(a_s.asset_id=a.id)" +
        " WHERE a_s.`isAvailable`='true' ;";

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
/* TESTED
 SELECT a_s.name, a_s.intermediateAccount, a_s.gateFee, a_s.walletType, a_s.backingCoinType,
 a_s.symbol, a_s.supportsMemos, a_s.addressType, a_s.isAvailable, a_s.minimalDeposit, a_s.minimalWithdraw,
 a_s.hasFee, a_s.feeType, a_s.displayMemoField, a_s.pointPrecision, a_s.disableGateFeeField,
 a_s.validateAddress, a_s.unitParts, a.easydex_bts_object
 FROM `asset_settings` a_s
 JOIN `asset` a
 ON(a_s.asset_id=a.id)
 WHERE a_s.isAvailable ='true';
 */

