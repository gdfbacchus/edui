var path = require("path");
var url = require("url");
var express = require("express");
var bodyParser = require("body-parser");

var app = express();
var http = require('http');
var server = http.createServer(app);
var io = require('socket.io')(server);

var env = process.env.NODE_ENV;
if(!process.env.NODE_ENV || (process.env.NODE_ENV && process.env.NODE_ENV!== 'production') ) {
  env = 'production';
  process.env.NODE_ENV = 'production';
} else {
  env = (process.env.NODE_ENV).trim();
}

console.log('ENV:', env);

app.use(bodyParser.json());

var accountRoutes = require("./server/routes/account");

if( env==='production' ) {
  app.use( express.static(path.join(__dirname + '/dist')) );

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname + '/dist/index.html' ));
  });
} else {
  res.status(500).json({ error: 'index.html is not available.' })
}

app.post('/api/account/saveEncPass', accountRoutes.storeEncryptedPassword);
app.post('/api/account/getAndSendAnswer', accountRoutes.usernameVerification);
app.post('/api/account/verifyToken', accountRoutes.tokenVerification);
app.post('/api/account/verifyAnswer', accountRoutes.answerVerification);

app.listen(3000, function(err) {
  if (err) {
    return console.error(err);
  }
  console.log("Express HTTP-server listen on 3000 port");
});


// io.on('connection', function(){ console.log("WS-server is running") });
//
// server.listen(8082, function(err) {
//   if (err) {
//     return console.error(err);
//   }
//   console.log("HTTP for WS listen on 8082 port");
// });

