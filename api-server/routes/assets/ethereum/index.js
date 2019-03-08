var depositRoute = require('./deposit/deposit');
var saveWithdrawRoute = require('./withdraw/saveWithdraw');
var updateWithdrawDataRoute = require('./withdraw/updateWithdrawData');
var getAddressRoute = require('./deposit/get-address');

module.exports.getAddress = getAddressRoute.getAddress;
module.exports.depositRoute = depositRoute.deposit;
module.exports.saveWithdrawRoute = saveWithdrawRoute.saveWithdraw;
module.exports.updateWithdrawDataRoute = updateWithdrawDataRoute.updateWithdrawData;





