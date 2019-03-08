// function getCurrentUTCtime(){
//   var date;
//   date = new Date();
//   date = date.getUTCFullYear() + '-' +
//     ('00' + (date.getUTCMonth()+1)).slice(-2) + '-' +
//     ('00' + date.getUTCDate()).slice(-2) + ' ' +
//     ('00' + date.getUTCHours()).slice(-2) + ':' +
//     ('00' + date.getUTCMinutes()).slice(-2) + ':' +
//     ('00' + date.getUTCSeconds()).slice(-2);
//
//   return date;
// }

function getCurrentUTCtime() {
  var date = new Date();
  var utcDate = date.toUTCString();

  // console.log("D----------------------------------------------");
  // console.log("DATE: ",date);
  // console.log("UTC DATE: ",date.toUTCString());
  // console.log("D----------------------------------------------");

  return utcDate;
}
module.exports.getCurrentUTCtime = getCurrentUTCtime;


//USE
//var getCurrentUTCtime = require('../../../../api-helpers/dateHelper').getCurrentUTCtime;
//var currentUtcTime = getCurrentUTCtime();

