var getAddressRoute = require('./deposit/get-address');
var walletnotifyRoute = require('./deposit/walletnotify');
var saveWithdraw = require('./withdraw/saveWithdraw');
var processReceivedBtsTx = require('./withdraw/processReceivedBtsTx');

var testZerorpc = require('./deposit/test-zerorpc');


module.exports.getAddress = getAddressRoute.getAddress;
module.exports.walletnotify = walletnotifyRoute.walletnotify;
module.exports.testZerorpc = testZerorpc.testZerorpc;
module.exports.saveWithdraw = saveWithdraw.saveWithdraw;
module.exports.processReceivedBtsTx = processReceivedBtsTx.processReceivedBtsTx;

