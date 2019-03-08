var getAddressRoute = require('./deposit/get-address');
var walletnotifyRoute = require('./deposit/walletnotify');
var saveWithdraw = require('./withdraw/saveWithdraw');
var processReceivedBtsTx = require('./withdraw/processReceivedBtsTx');

// var testWalletnotifyRoute = require('./deposit/test-walletnotify');
// var testTransfer = require('./deposit/test-transfer');
// var testZerorpc = require('./deposit/test-zerorpc');
// module.exports.testWalletnotify = testWalletnotifyRoute.testWalletnotify;
// module.exports.testTransfer = testTransfer.testTransfer;
// module.exports.testZerorpc = testZerorpc.testZerorpc;

module.exports.getAddress = getAddressRoute.getAddress;
module.exports.walletnotify = walletnotifyRoute.walletnotify;
module.exports.saveWithdraw = saveWithdraw.saveWithdraw;
module.exports.processReceivedBtsTx = processReceivedBtsTx.processReceivedBtsTx;

