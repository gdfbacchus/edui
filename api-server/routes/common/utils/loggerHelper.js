/*
Example:
  logErrorMessage = formatLogMsg('ERROR', req.body, "Result data from dbScripts.getInitialWithdrawData() method, cannot be parsed.", resp, err, logContext);

  logMessage = formatLogMsg('INFO', null, "Generated easydexCode", {easydexCode: easydexCode}, null, logContext);
 */
/**
 *
 * @param level
 * @param reqData
 * @param msg
 * @param data
 * @param err
 * @param context
 * @returns {string}
 */
var formatLogMsg = function (level, reqData, msg, data, err, context) {
  var message = '>>>';
  if(level) {
    message += "LEVEL::["+level+"] ";
  }
  if(reqData) {
    message += "REQUEST::["+JSON.stringify(reqData)+"] ";
  }
  if(msg) {
    message += "MESSAGE::["+msg+"] ";
  }
  if(data) {
    message += "DATA::["+JSON.stringify(data)+"] ";
  }
  if(err) {
    message += "ERROR::["+err+"] ";
  }
  if(context) {
    message += "CONTEXT::["+context+"] ";
  }

  message+="<<<";

  return message;
}

module.exports.formatLogMsg = formatLogMsg ;