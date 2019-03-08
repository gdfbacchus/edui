
var makeEasydexCode = function(len) {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var milisecTimestamp = new Date().getTime();

  for (var i = 0; i < len; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return "easydex-w-code_" + text + "_" + milisecTimestamp;
};

module.exports.makeEasydexCode = makeEasydexCode ;