var path = require("path");
var url = require("url");
var webpack = require("webpack");
var express = require("express");
var bodyParser = require("body-parser");

var app = express();
var webpackDevMiddleware = require("webpack-dev-middleware");
var ProgressPlugin = require("webpack/lib/ProgressPlugin");

var currentENV = process.env.NODE_ENV ? (process.env.NODE_ENV).trim() : 'development';
var isProd = currentENV == 'production';
var isDev = currentENV == 'development';



console.log("currentENV: ",currentENV);
// console.log("ENV is production: ",isProd);
// console.log("ENV is development1: ",isDev);

app.use(bodyParser.json());
//var accountRoutes = require("./app/server/routes/account");
var accountRoutes = require("../server/routes/account");

var config = require("./webpack_2.config.js")({
    SET:"EU1",
    "electron":!!~process.argv.indexOf("electron"),
    "hash":!!~process.argv.indexOf("hash")
});
var compiler = webpack(config);

compiler.apply(new ProgressPlugin(function(percentage, msg) {
    process.stdout.write((percentage * 100).toFixed(2) + '% ' + msg + '                 \033[0G');
}));

app.use(webpackDevMiddleware(compiler, {
    publicPath: "/",
    historyApiFallback: true
}));

app.get("*", function(req, res) {
    let parsedUrl = url.parse(req.url, true);

    // if(~parsedUrl.pathname.indexOf("/abcui/assets/")){
    //     let filepath = __dirname + parsedUrl.pathname;
    //     console.log('@>filepath',filepath)
    //     res.sendFile(filepath)
    // }else{
    //     res.sendFile(__dirname + '/app/assets/index.html')
    // }
  res.sendFile(__dirname + '/app/assets/index.html');
});

app.post('/api/account/saveEncPass', accountRoutes.storeEncryptedPassword);
app.post('/api/account/getAndSendAnswer', accountRoutes.usernameVerification);
app.post('/api/account/verifyToken', accountRoutes.tokenVerification);
app.post('/api/account/verifyAnswer', accountRoutes.answerVerification);

app.listen(8080,"0.0.0.0", function(err) {
    if (err) {
        return console.error(err);
    }
    console.log("http://0.0.0.0:8080");
});
