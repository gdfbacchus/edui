var mysql = require('mysql');

var handleDisconnect = function (db_config) {
  var mysql_connection;
  mysql_connection = mysql.createConnection(db_config); // Recreate the connection, since
  // the old one cannot be reused.

  mysql_connection.connect(function(err) {              // The server is either down
    if(err) {                                     // or restarting (takes a while sometimes).
      console.log('error when connecting to db:', err);
      setTimeout(handleDisconnect, 2000); // We introduce a delay before attempting to reconnect,
    }                                     // to avoid a hot loop, and to allow our node script to
  });                                     // process asynchronous requests in the meantime.
                                          // If you're also serving http, display a 503 error.
  mysql_connection.on('error', function(err) {
    console.log('handleDisconnect :: db error', err);
    if(err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
      console.log('IT IS RECONNECTING NOW ...');
      handleDisconnect(db_config);                         // lost due to either server restart, or a
    } else {                                      // connnection idle timeout (the wait_timeout
      throw err;                                  // server variable configures this)
    }
  });
  return mysql_connection;
};

//CREATE POOL
var createMysqlPool = function (db_config) {
  var mysql_pool;
  mysql_pool = mysql.createPool(db_config); // Recreate the connection, since
  // the old one cannot be reused.

  // mysql_connection.connect(function(err) {              // The server is either down
  //   if(err) {                                     // or restarting (takes a while sometimes).
  //     console.log('error when connecting to db:', err);
  //     setTimeout(handlePoolDisconnect, 2000); // We introduce a delay before attempting to reconnect,
  //   }                                     // to avoid a hot loop, and to allow our node script to
  // });                                     // process asynchronous requests in the meantime.
  //                                         // If you're also serving http, display a 503 error.
  // mysql_connection.on('error', function(err) {
  //   console.log('handleDisconnect :: db error', err);
  //   if(err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
  //     console.log('IT IS RECONNECTING NOW ...');
  //     handlePoolDisconnect(db_config);                         // lost due to either server restart, or a
  //   } else {                                      // connnection idle timeout (the wait_timeout
  //     throw err;                                  // server variable configures this)
  //   }
  // });
  return mysql_pool;
};

module.exports.handleDisconnect = handleDisconnect ;

module.exports.createMysqlPool = createMysqlPool ;