const path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = {
  target: "node",
  entry: {
    app: ["./app.js"]
  },
  output: {
    path: path.resolve(__dirname, "build-api"),
    filename: "bundle-back.js"
  },
  externals: [nodeExternals()],
};