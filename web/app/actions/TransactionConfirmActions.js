import alt from "alt-instance";
import {ChainConfig} from "bitsharesjs-ws";
import counterpart from "counterpart";
import { saveFiatWithdrawData } from "common/blockTradesMethods";

function parse_error(err) {
    let clear_error = "unknown error";

    function reg_exp_err(error) {
        return error.toLowerCase().split('{')[0].match(/[a-z,0-9,\,\-]+/g).filter((e, i, arr) => {
            return arr[i] !== arr[i + 1] && arr[i] !== arr[i + 2];
        }).join(' ');
    }

    if (~err.indexOf("bitshares-crypto")) {
        err = err.split("bitshares-crypto")[0];
        if (~err.indexOf("Insufficient Balance: ")) {
            let amount = err.split("Insufficient Balance: ")[1].split(",")[0];
            return `Not enough balance ${amount}, check fees settings and your balances.`;
        } else {
            return reg_exp_err(err);
        }
    } else {
        return reg_exp_err(error);
    }

}

class TransactionConfirmActions {

    confirm(transaction, resolve, reject) {
        return {transaction, resolve, reject};
    }

    broadcast(transaction, resolve, reject) {
        return (dispatch) => {
            dispatch({broadcasting: true, closed: true});

            let broadcast_timeout = setTimeout(() => {
                dispatch({
                    broadcast: false,
                    broadcasting: false,
                    error: counterpart.translate("trx_error.expire"),
                    closed: false
                });
                if (reject) reject();
            }, ChainConfig.expire_in_secs * 2000);

            transaction.broadcast(() => {
                dispatch({broadcasting: false, broadcast: true});
            }).then( (res)=> {
                clearTimeout(broadcast_timeout);

              //SAVE DATA AFTER SUCCESS
              let transferSerialized = transaction.serialize();
              // console.log("this.props.transaction: ",this.props.transaction);
              // console.log("------------------------------------------------------");
              // console.log("transferSerialized: ",transferSerialized);
              // console.log("this.props.resolve: ",this.props.resolve);
              // console.log("this.props.reject: ",this.props.reject);
              // console.log("transferSerialized.operations[0][0]===0 : ", transferSerialized.operations[0][0]===0);
              // console.log("transferSerialized.operations[0] : ", transferSerialized.operations[0][0]);
              //If the transaction is transfer(with index 0)
              //console.log("Transaction result: ",res);
              if(transferSerialized.operations[0][0]==0) {
                let txData = transferSerialized.operations[0][1];
                if(txData.amount.asset_id === "1.3.3060" || txData.amount.asset_id === "1.3.3062") {
                  let dataToSave = {
                    from_account: txData.from,
                    to_account: txData.to,
                    amount: (parseInt(txData.amount.amount) / 100),
                    asset: txData.amount.asset_id,
                    fee_asset_id: txData.fee.asset_id,
                    fee_asset_amount_sats: txData.fee.amount,
                    output_coin_type: txData.amount.asset_id === "1.3.3060" ? "USD" : "EUR",
                    trx_id: res[0].id,
                    trx_block_num: res[0].block_num
                  };
                  //console.log("fiat withdraw dataToSave: ",dataToSave);
                  saveFiatWithdrawData(dataToSave);
                }

                //if(txData.amount.asset_id) {

                  // from_account,
                  // to_account,
                  // amount2,
                  // asset2,

                  // memo,
                  // minerFee,
                  // fee_asset_id,
                  // fee_asset_amount,
                  // asset_address,
                  // output_coin_type: this.props.output_coin_type


                //}
              }

                dispatch({
                    error: null,
                    broadcasting: false,
                    broadcast: true,
                    included: true,
                    trx_id: res[0].id,
                    trx_block_num: res[0].block_num,
                    broadcasted_transaction: true
                });
                if (resolve) resolve();

            }).catch( error => {
                console.error(error);
                clearTimeout(broadcast_timeout);
                // messages of length 1 are local exceptions (use the 1st line)
                // longer messages are remote API exceptions (use the 2nd line)

                let clear_error = parse_error(error.message);

                dispatch({
                    broadcast: false,
                    broadcasting: false,
                    error: clear_error,
                    closed: false
                });
                if (reject) reject();
            });
        };
    }

    wasBroadcast(res){
        return res;
    }

    wasIncluded(res){
        return res;
    }

    close() {
        return true;
    }

    error(msg) {
        return {error: msg};
    }

    togglePropose() {
        return true;
    }

    proposeFeePayingAccount(fee_paying_account) {
        return fee_paying_account;
    }
}

export default alt.createActions(TransactionConfirmActions);
