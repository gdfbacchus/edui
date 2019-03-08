
const path = require('path');
const nodeExternals = require('webpack-node-externals');
const webpack = require('webpack');
const fs = require('fs');


const frontConfig = {
  // Stuff the entire webpack-front.config.js
  // without the require and module.exports lines
  //...
};


// Combined 'module.exports'
// module.exports = [ frontConfig, backConfig ];
//module.exports = [ backConfig ];

module.exports = function(options = {}) {
  console.log("options: ", options);

  var outputPath = "";
  var outputBundleFileName = "";
  var entryPoint = [];
  var sourceLoggerSettings = "";

  try{
    var sourceUiSettings = "";
    var destinationUiSettings = path.resolve(__dirname, "api-server.config.js");
    var destinationLoggerSettings = path.resolve(__dirname, "logger/logger.js");

    if(options.STAGING  && options.STAGING == 1) {
      console.log("STAGING");
      sourceUiSettings = path.resolve(__dirname, "config/staging/api-server.config.js");
      sourceLoggerSettings = path.resolve(__dirname, "logger/staging/logger.js");

      entryPoint.push("./app-test.js");
      outputPath = path.resolve(__dirname, "./build-api-test");
      outputBundleFileName = "app-test.js"
    } else {
      console.log("PROD");
      sourceUiSettings = path.resolve(__dirname, "config/prod/api-server.config.js");
      sourceLoggerSettings = path.resolve(__dirname, "logger/prod/logger.js");

      entryPoint.push("./app.js");
      outputPath = path.resolve(__dirname, "./build-api");
      outputBundleFileName = "app.js";
    }
    //REPLACE WITH PROPER FILE DEPENDING ON SERVER(prod or staging)
    replaceFile(sourceUiSettings, destinationUiSettings);
    replaceFile(sourceLoggerSettings, destinationLoggerSettings);

  } catch (err) {
    console.log("ERROR::: ",err);
    throw err;
  }

  const backConfig = {
    target: "node",
    entry: {
      app: entryPoint
    },
    output: {
      path: outputPath,
      filename: outputBundleFileName
    },
    externals: [nodeExternals()],
  };

  return [ backConfig ];
};


function replaceFile(source, destination) {
  if (fs.existsSync(source)) {
    copyFileSync(source, destination);
  }
}

function copyFileSync(srcFile, destFile) {
  var BUF_LENGTH, buff, bytesRead, fdr, fdw, pos;
  BUF_LENGTH = 64 * 1024;
  buff = new Buffer(BUF_LENGTH);
  fdr = fs.openSync(srcFile, 'r');
  fdw = fs.openSync(destFile, 'w');
  bytesRead = 1;
  pos = 0;
  while (bytesRead > 0) {
    bytesRead = fs.readSync(fdr, buff, 0, BUF_LENGTH, pos);
    fs.writeSync(fdw, buff, 0, bytesRead);
    pos += bytesRead;
  }
  fs.closeSync(fdr);
  return fs.closeSync(fdw);
};
