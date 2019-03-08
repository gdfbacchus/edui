exports.getExistingAddress = function (req, res) {
  var asset = req.body.asset;
  var username = req.body.username;

  return new Promise((resolve, reject) => {
    res.locals.connectionPool.getConnection(function(err, connection) {
      if (err) {
        return reject(err)
      }
      var query = "select wa.address as address, wa.account_name as username, " +
        "a.easydex_asset_name, a.asset_name, a.easydex_bts_object " +
        "from wallet_address wa " +
        "join asset a " +
        "on(wa.asset_id=a.id) " +
        "where a.asset_name=" + connection.escape(asset) + " " +
        "and wa.account_name=" + connection.escape(username) + " ;";
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

exports.insertAddress = function (res, addrData) {
  var address = addrData.address;
  var username = addrData.username;
  var assetId = addrData.assetId;

  return new Promise((resolve, reject) => {
    res.locals.connectionPool.getConnection(function(err, connection) {
      if (err) {
        return reject(err)
      }
      var insertQuery = "INSERT INTO `wallet_address`(`address`, `account_name`, `asset_id`) " +
        "VALUES (" + connection.escape(address) + "," + connection.escape(username) + ", " + connection.escape(assetId) + ");";

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

exports.getAssetInfo = function (res, asset) {

  return new Promise((resolve, reject) => {
    res.locals.connectionPool.getConnection(function(err, connection) {
      if (err) {
        return reject(err)
      }

      var query = "select id, asset_name, easydex_asset_name, description,	easydex_bts_object,	bts_object " +
      "from asset " +
      "where asset_name=" + connection.escape(asset) + " ;";

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

//Escaping 1
// var userId = 'some user provided value';
// var sql    = 'SELECT * FROM users WHERE id = ' + connection.escape(userId);
//
// connection.query(sql, function (error, results, fields) {
//   if (error) throw error;
//   // ...
// });

//Escaping 2
// connection.query('UPDATE users SET foo = ?, bar = ?, baz = ? WHERE id = ?', ['a', 'b', 'c', userId], function (error, results, fields) {
//   if (error) throw error;
//   // ...
// });

//Escaping 3
// var post  = {id: 1, title: 'Hello MySQL'};
//
// var query = connection.query('INSERT INTO posts SET ?', post, function (error, results, fields) {
//   if (error) throw error;
//   // Neat!
// });
// console.log(query.sql); // INSERT INTO posts SET `id` = 1, `title` = 'Hello MySQL'

//Escaping 4
//
// var query = "SELECT * FROM posts WHERE title=" + mysql.escape("Hello MySQL");
//
// console.log(query); // SELECT * FROM posts WHERE title='Hello MySQL'

//
//
// Preparing Queries
//
// You can use mysql.format to prepare a query with multiple insertion points,
//  utilizing the proper escaping for ids and values. A simple example of this follows:
//
// var sql = "SELECT * FROM ?? WHERE ?? = ?";
// var inserts = ['users', 'id', userId];
// sql = mysql.format(sql, inserts);