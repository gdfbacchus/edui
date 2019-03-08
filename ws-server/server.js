var express = require("express");
var bodyParser = require("body-parser");
var app = express();
var http = require('http');

var server = http.createServer(app);
var io = require('socket.io')(server);
app.use(bodyParser.json());
var accountRoutes = require("../server/routes/account");

app.post('/api/account/saveEncPass', accountRoutes.storeEncryptedPassword);
app.post('/api/account/getAndSendAnswer', accountRoutes.usernameVerification);
app.post('/api/account/verifyToken', accountRoutes.tokenVerification);
app.post('/api/account/verifyAnswer', accountRoutes.answerVerification);


io.on('connection', function(){ console.log("WS is connected") });
server.listen(4000);


