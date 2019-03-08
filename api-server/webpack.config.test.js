// Combined 'require' statements
const path = require('path');
const nodeExternals = require('webpack-node-externals');
const webpack = require('webpack');

const frontConfig = {
  // Stuff the entire webpack-front.config.js
  // without the require and module.exports lines
  //...
};
const backConfig = {
  // Stuff the entire webpack-back.config.js
  // without the require and module.exports lines
  target: "node",
  entry: {
    app: ["./app-test.js"]
  },
  output: {
    path: path.resolve(__dirname, "./build-api-test"),
    filename: "app-test.js"
  },
  externals: [nodeExternals()],
};

// Combined 'module.exports'
// module.exports = [ frontConfig, backConfig ];
module.exports = [ backConfig ];