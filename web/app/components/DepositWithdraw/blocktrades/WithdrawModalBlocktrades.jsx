import React from "react";
import Trigger from "react-foundation-apps/src/trigger";
import Translate from "react-translate-component";
import ChainTypes from "components/Utility/ChainTypes";
import BindToChainState from "components/Utility/BindToChainState";
import utils from "common/utils";
import BalanceComponent from "components/Utility/BalanceComponent";
import counterpart from "counterpart";
import AmountSelector from "components/Utility/AmountSelector";
import AccountActions from "actions/AccountActions";
import ZfApi from "react-foundation-apps/src/utils/foundation-api";
import { validateAddressED, saveWithdrawData, WithdrawAddresses } from "common/blockTradesMethods";
import { ChainStore } from "bitsharesjs/es";
import Modal from "react-foundation-apps/src/modal";
import { checkFeeStatusAsync, checkBalance } from "common/trxHelper";
import { Asset } from "common/MarketClasses";
import { debounce } from "lodash";
import endpoints from "../../../assets/constants/endpoints";
import { withdrawFees } from "../../../assets/constants/fees";
import WalletDb from "stores/WalletDb";
import ReactTooltip from "react-tooltip";
import WalletUnlockActions from "actions/WalletUnlockActions";

import {
    hiddenMemoAssetIds,
    customValidations
    //easydexAssetSettings
} from "assets/constants/assets";

class WithdrawModalBlocktrades extends React.Component {

    static propTypes = {
        account: ChainTypes.ChainAccount.isRequired,
        issuer: ChainTypes.ChainAccount.isRequired,
        asset: ChainTypes.ChainAsset.isRequired,
        output_coin_name: React.PropTypes.string.isRequired,
        output_coin_symbol: React.PropTypes.string.isRequired,
        output_coin_type: React.PropTypes.string.isRequired,
        url: React.PropTypes.string,
        output_wallet_type: React.PropTypes.string,
        output_supports_memos: React.PropTypes.bool.isRequired,
        amount_to_withdraw: React.PropTypes.string,
        balance: ChainTypes.ChainObject,
        coinOptions: React.PropTypes.object.isRequired
    };

    constructor(props) {
        super(props);

        this.state = {
            withdraw_amount: this.props.amount_to_withdraw,
            withdraw_address: WithdrawAddresses.getLast(props.output_wallet_type),//Get from localStorage
            withdraw_address_check_in_progress: true,
            withdraw_address_is_valid: null,
            options_is_valid: false,
            confirmation_is_valid: false,
            withdraw_address_selected: WithdrawAddresses.getLast(props.output_wallet_type),//Get from localStorage
            memo: "",
            withdraw_address_first: true,
            isValidWithdrawAmount: true,
            empty_withdraw_value: false,
            from_account: props.account,
            fee_asset_id: "1.3.0",
            feeStatus: {},
            minerFee: 0,
            isValidMinerFee: true,
            minimalWithdraw: this.props.minimalWithdraw,
            easydexAssetSettings : this.props.coinOptions
        };

        this._checkBalance = this._checkBalance.bind(this);
        this._updateFee = debounce(this._updateFee.bind(this), 250);
        this._setDefaultMinerFee = this._setDefaultMinerFee.bind(this);
        this._checkMinerFee = this._checkMinerFee.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
        this.preSubmit = this.preSubmit.bind(this);
        this._openInNewTab = this._openInNewTab.bind(this);
    }

    componentWillMount() {
        this._validateAddress(this.state.withdraw_address, this.props);
        this._updateFee();
        this._checkFeeStatus();
        this._setDefaultMinerFee();
    }
    componentDidMount(){
      let coinSettings = this.state.easydexAssetSettings;
      if(!coinSettings.validateAddress){
        this.setState({
          withdraw_address_is_valid: true
        });
      }
    }

    componentWillUnmount() {
        this.unMounted = true;
    }

    componentWillReceiveProps(np) {
        if (np.account !== this.state.from_account && np.account !== this.props.account) {
            this.setState({
                from_account: np.account,
                feeStatus: {},
                fee_asset_id: "1.3.0",
                feeAmount: new Asset({ amount: 0 })
            }, () => { this._updateFee(); this._checkFeeStatus(); });
        }
    }

    _updateFee(state = this.state) {
        let { fee_asset_id, from_account } = state;
        const { fee_asset_types } = this._getAvailableAssets(state);
        if (fee_asset_types.length === 1 && fee_asset_types[0] !== fee_asset_id) {
            fee_asset_id = fee_asset_types[0];
        }

        if (!from_account) return null;
        checkFeeStatusAsync({
            accountID: from_account.get("id"),
            feeID: fee_asset_id,
            options: ["price_per_kbyte"],
            data: {
                type: "memo",
                content: this.props.output_coin_type + ":" + state.withdraw_address + (state.memo ? ":" + state.memo : "")
            }
        })
            .then( ({ fee, hasBalance, hasPoolBalance }) => {
                if (this.unMounted) return;

                this.setState({
                    feeAmount: fee,
                    hasBalance,
                    hasPoolBalance,
                    error: (!hasBalance || !hasPoolBalance)
                }, this._checkBalance);
            });
    }

    _checkFeeStatus(state = this.state) {
        let account = state.from_account;
        if (!account) return;

        const { fee_asset_types: assets } = this._getAvailableAssets(state);
        // const assets = ["1.3.0", this.props.asset.get("id")];
        let feeStatus = {};
        let p = [];
        assets.forEach(a => {
            p.push(checkFeeStatusAsync({
                accountID: account.get("id"),
                feeID: a,
                options: ["price_per_kbyte"],
                data: {
                    type: "memo",
                    content: this.props.output_coin_type + ":" + state.withdraw_address + (state.memo ? ":" + state.memo : "")
                }
            }));
        });
        Promise.all(p).then(status => {
            assets.forEach((a, idx) => {
                feeStatus[a] = status[idx];
            });
            if (!utils.are_equal_shallow(state.feeStatus, feeStatus)) {
                this.setState({
                    feeStatus
                });
            }
            this._checkBalance();
        }).catch(err => {
            console.error(err);
        });
    }

    onMemoChanged(e) {
        this.setState({ 
            memo: e.target.value
        }, this._updateFee);
    }

    onWithdrawAmountChange({ amount }) {
      this._isValidWithdrawAmount(amount);
        this.setState({
            withdraw_amount: amount,
            empty_withdraw_value: amount !== undefined && !parseFloat(amount)
        }, this._checkBalance);

    }

    onSelectChanged(index) {
        let new_withdraw_address = WithdrawAddresses.get(this.props.output_wallet_type)[index];
        WithdrawAddresses.setLast({ wallet: this.props.output_wallet_type, address: new_withdraw_address });

        let coinSettings = this.state.easydexAssetSettings;
        let isValid = coinSettings.validateAddress ? null : true;

      this.setState({
            withdraw_address_selected: new_withdraw_address,
            options_is_valid: false,
            withdraw_address: new_withdraw_address,
            withdraw_address_check_in_progress: true,
            withdraw_address_is_valid: isValid
        }, this._updateFee);

      this._validateAddress(new_withdraw_address);


    }

    onWithdrawAddressChanged(e) {
        let new_withdraw_address = e.target.value.trim();
        let coinSettings = this.state.easydexAssetSettings;
        let isValid = coinSettings.validateAddress ? null : true;

        this.setState({
            withdraw_address: new_withdraw_address,
            withdraw_address_check_in_progress: true,
            withdraw_address_selected: new_withdraw_address,
            withdraw_address_is_valid: isValid
        }, this._updateFee);

        this._validateAddress(new_withdraw_address);
    }

    _validateAddress(new_withdraw_address, props = this.props) {
        let coinSettings = this.state.easydexAssetSettings;
        //console.log(coinSettings.validateAddress)
        if(!coinSettings.validateAddress){
          //console.log("coinSettings.validateAddress: ",coinSettings.validateAddress);
          this.setState({
            withdraw_address_check_in_progress: false
          });
          return;
        }

        if(!new_withdraw_address)return;

      let strRegex = customValidations[coinSettings.name].addressValidation;
      //console.log("strRegex: ",strRegex);
      if(strRegex){
        let regEx = new RegExp(strRegex);
        let result = regEx.test(new_withdraw_address);
        // console.log("CHECK CUSTOM: ");
        // console.log("RES: ",result);
        this.setState({
          withdraw_address_check_in_progress: false,
          withdraw_address_is_valid: result
        });
      }
      else {

        var url = endpoints.NODE_JS_API.SERVER + endpoints.NODE_JS_API.URLS.validateAddress;
        validateAddressED({ url: url, walletType: props.output_wallet_type, newAddress: new_withdraw_address })
            .then(isValid => {
                if (this.state.withdraw_address === new_withdraw_address) {
                    this.setState({
                        withdraw_address_check_in_progress: false,
                        withdraw_address_is_valid: isValid
                    });
                }
            });
      }
    }

    _setDefaultMinerFee() {
      let coinType = this.props.output_coin_name;
      let defValue = withdrawFees[coinType].minerFee.DEFAULT_MINER_FEE;
      this.setState({minerFee: parseFloat(defValue).toFixed(this.props.asset.get("precision"))});
    }

    _onChangeMinerFee(event) {
        let newMinerFee = event.target.value;
        this._checkMinerFee(newMinerFee);
        this.setState({minerFee: newMinerFee});
    };

    _checkMinerFee(fee) {
      let realFee = null;
      let coinType = this.props.output_coin_name;

      if (typeof fee === "string") {
        console.log("STR")
        realFee = parseFloat(fee);
      } else {
        realFee = fee;
      }

      var isValid =  realFee >= withdrawFees[coinType].minerFee.MIN_MINER_FEE ? true : false;
      this.setState({isValidMinerFee: isValid});
    };

    _checkBalance() {
        const { feeAmount, withdraw_amount } = this.state;
        const { asset, balance, gateFee, minerFee } = this.props;

        if (balance === null) {
            this.setState({ balanceError: true });
            return;
        };

        if (!feeAmount) return;
        const hasBalance = checkBalance(withdraw_amount, asset, feeAmount, balance, this.state.minerFee);

        //if (hasBalance === null) return;
        this.setState({ balanceError: !hasBalance });
        return hasBalance;
    }

    _isValidWithdrawAmount(value) {
        let newVal = parseFloat(parseFloat(value).toFixed(8));
        let isValid = newVal >= this.state.minimalWithdraw;
        this.setState({isValidWithdrawAmount: isValid});//REAL//TODO UNCOMMENT THIS LINE AFTER TESTING, COMMENT FOR TESTING
        //this.setState({isValidWithdrawAmount: true});//ONLY FOR TEST//TODO REMOVE THIS LINE AFTER TESTING, COMMENT FOR TESTING
    }

    _toggleLock() {
        WalletUnlockActions.unlock().then(() => {
          this.preSubmit();
            ReactTooltip.rebuild();
        });
    }

    proceedWithUnlocked(){
      if (WalletDb.isLocked()) {
        WalletUnlockActions.unlock().then(() => {
          this.preSubmit();
          ReactTooltip.rebuild();
        });
      } else {
        this.preSubmit();
      }
    }

    preSubmit() {
        let asset = this.props.asset;
        let assetPrecision = asset.get("precision");
        const { feeAmount } = this.state;
        const amount = parseFloat(String.prototype.replace.call(this.state.withdraw_amount, /,/g, ""));
        const minerFee = String.prototype.replace.call(this.state.minerFee, /,/g, "");
        //console.log("minerFee: ", minerFee);

        if(!amount || !this.state.isValidWithdrawAmount || !this.state.isValidMinerFee ) {
            //console.log("amount or minerFee is not valid!");
            //console.log("amount: ",amount);
            //console.log("isValidMinerFee: ", this.state.isValidMinerFee);
            //console.log("isValidWithdrawAmount: ", this.state.isValidWithdrawAmount);
            return;
        }

        let sendAmount = new Asset({
            asset_id: asset.get("id"),
            precision: assetPrecision,
            real: amount
        });

        let balanceAmount = sendAmount.clone(this.props.balance.get("balance"));

        /* Insufficient balance */
        if (balanceAmount.lt(sendAmount)) {
            sendAmount = balanceAmount;
        }

        let from_account = this.props.account.get("id");
        let to_account = this.props.issuer.get("id");
        let amount2 = sendAmount.getAmount({ real: true });
        let asset2 = asset.get("id");
        let memo = this.state.memo ? this.state.memo : "";
        let totalToSend = parseFloat( (amount2 + parseFloat(minerFee)).toFixed(assetPrecision) );

        let fee_asset_id = feeAmount ? feeAmount.asset_id : "1.3.0";
        let fee_asset_amount = this.state.feeAmount.getAmount({ real: true });
        let asset_address = this.state.withdraw_address;

        let coinSettings = this.state.easydexAssetSettings;
        if(asset_address.length>0 && !coinSettings.validateAddress){
          //console.log("coinSettings.validateAddress: ",coinSettings.validateAddress);
          this.setState({
            withdraw_address_check_in_progress: false
          });
        }

        // console.log("from_account: ", from_account);
        // console.log("to_account: ", to_account);
        // console.log("amount: ", amount2);
        // console.log("minerFee: ", minerFee);
        //
        // console.log("asset: ", asset2);
        // console.log("fee_asset_id: ", fee_asset_id);
        // console.log("fee_asset_amount: ", fee_asset_amount);
        // console.log("asset_address: ", asset_address);
        // console.log("this.props.output_coin_type: ", this.props.output_coin_type);
        // console.log("memo: ", memo);
        // console.log("memo: ");

        //return;
      // saveWithdrawData
      saveWithdrawData({
        from_account,
        to_account,
        amount2,
        asset2,
        memo,
        minerFee,
        fee_asset_id,
        fee_asset_amount,
        asset_address,
        output_coin_type: this.props.output_coin_type
      }, this.onSubmit )
        // .then(response => {
        //   //console.log("saving Init Data is finished: ", response);
        // })
      // .catch(function (err) {
      //       console.error(err);
      //   });

    }

    onSubmit(res) {
        let code = res.response.easydexCode;
        //console.log("code to send: ",code);
        if(!code){
            alert("NetworkError when attempting to fetch resource. API is not accessible");
            return;
        }

        // console.log("this.state.withdraw_address_check_in_progress: ",this.state.withdraw_address_check_in_progress);
        // console.log("this.state.withdraw_address.length: ",this.state.withdraw_address.length);
        // console.log("this.state.withdraw_amount !== null: ",this.state.withdraw_amount !== null);
        // console.log("this.state.withdraw_address_is_valid: ",this.state.withdraw_address_is_valid);
        // console.log("this.state.isValidWithdrawAmount: ",this.state.isValidWithdrawAmount);

        let asset = this.props.asset;
        // let coinSettings = easydexAssetSettings[asset.get("id")];
        let coinSettings = this.state.easydexAssetSettings;


        if ((!this.state.withdraw_address_check_in_progress)
            && (this.state.withdraw_address
            && this.state.withdraw_address.length)
            && (this.state.withdraw_amount !== null)
            && this.state.isValidWithdrawAmount//TODO UNCOMMENT THIS LINE AFTER TESTING, COMMENT FOR TESTING
        ) {
          // console.log("code to send 1: ",code);
            if (!this.state.withdraw_address_is_valid) {
              // console.log("code to send 2: ",code);
                ZfApi.publish(this.getWithdrawModalId(), "open");
            } else if (parseFloat(this.state.withdraw_amount) > 0) {
              // console.log("code to send 3: ",code);
                if (!WithdrawAddresses.has(this.props.output_wallet_type)) {
                    let withdrawals = [];
                    withdrawals.push(this.state.withdraw_address);
                    WithdrawAddresses.set({ wallet: this.props.output_wallet_type, addresses: withdrawals });
                } else {
                    let withdrawals = WithdrawAddresses.get(this.props.output_wallet_type);
                    if (withdrawals.indexOf(this.state.withdraw_address) == -1) {
                        withdrawals.push(this.state.withdraw_address);
                        WithdrawAddresses.set({ wallet: this.props.output_wallet_type, addresses: withdrawals });
                    }
                }
                WithdrawAddresses.setLast({ wallet: this.props.output_wallet_type, address: this.state.withdraw_address });


                let assetPrecision = asset.get("precision");

                const { feeAmount } = this.state;
                const amount = parseFloat(String.prototype.replace.call(this.state.withdraw_amount, /,/g, ""));

                let sendAmount = new Asset({
                    asset_id: asset.get("id"),
                    precision: asset.get("precision"),
                    real: amount
                });

                let balanceAmount = sendAmount.clone(this.props.balance.get("balance"));

                /* Insufficient balance */
                if (balanceAmount.lt(sendAmount)) {
                    sendAmount = balanceAmount;
                }
                let text = this.state.memo;
                const minerFee = String.prototype.replace.call(this.state.minerFee, /,/g, "");

                let totalToSend = sendAmount.getAmount() + (minerFee * coinSettings.unitParts);
                let totalFloat = parseFloat( (sendAmount.getAmount({real:true}) + parseFloat(minerFee)).toFixed(assetPrecision) );


                let memo = {
                    easydex_code: code,
                    asset: asset.get("id"),
                    from_account: this.props.account.get("id"),
                    to_account: this.props.issuer.get("id"),
                    address: this.state.withdraw_address,
                    totalAmount: totalFloat,
                    amount: sendAmount.getAmount({ real: true }),
                    minerFee: minerFee,
                    //totalAmount: sendAmount.getAmount({ real: true }) + parseFloat(minerFee).toFixed(8),
                    memo_text_msg: text
                };

                // console.log("amount s: ", sendAmount.getAmount());
                // console.log("minerFee s: ", minerFee);
                // console.log("total s: ", totalToSend );
                // console.log("memo s: ", memo);
                // console.log("totalFloat s: ", totalFloat);


                AccountActions.transfer(
                    this.props.account.get("id"),//from_account
                    this.props.issuer.get("id"),//to_account
                    totalToSend,//amount
                    asset.get("id"),//asset
                    JSON.stringify(memo),//memo
                    null,//propose_account
                    feeAmount ? feeAmount.asset_id : "1.3.0"//fee_asset_id default is BTS
                );

                this.setState({
                    empty_withdraw_value: false
                });
              ZfApi.publish(this.props.modal_id, "close");
            } else {
              console.log("code to send 4: ",code);
                this.setState({
                    empty_withdraw_value: true
                });
            }
        } else { /*console.log("code to send 5: ",code);*/}

    }

    onSubmitConfirmation() {
      return;
        // ZfApi.publish(this.getWithdrawModalId(), "close");
        //
        // if (!WithdrawAddresses.has(this.props.output_wallet_type)) {
        //     let withdrawals = [];
        //     withdrawals.push(this.state.withdraw_address);
        //     WithdrawAddresses.set({ wallet: this.props.output_wallet_type, addresses: withdrawals });
        // } else {
        //     let withdrawals = WithdrawAddresses.get(this.props.output_wallet_type);
        //     if (withdrawals.indexOf(this.state.withdraw_address) == -1) {
        //         withdrawals.push(this.state.withdraw_address);
        //         WithdrawAddresses.set({ wallet: this.props.output_wallet_type, addresses: withdrawals });
        //     }
        // }
        // WithdrawAddresses.setLast({ wallet: this.props.output_wallet_type, address: this.state.withdraw_address });
        // let asset = this.props.asset;
        // let precision = utils.get_asset_precision(asset.get("precision"));
        // let amount = String.prototype.replace.call(this.state.withdraw_amount, /,/g, "");
        //
        // const { feeAmount } = this.state;
        //
        // AccountActions.transfer(
        //     this.props.account.get("id"),
        //     this.props.issuer.get("id"),
        //     parseInt(amount * precision, 10),
        //     asset.get("id"),
        //     this.props.output_coin_type + ":" + this.state.withdraw_address + (this.state.memo ? ":" + new Buffer(this.state.memo, "utf-8") : ""),
        //     null,
        //     feeAmount ? feeAmount.asset_id : "1.3.0"
        // );
    }

    onDropDownList() {
        if (WithdrawAddresses.has(this.props.output_wallet_type)) {
            if (this.state.options_is_valid === false) {
                this.setState({ options_is_valid: true });
                this.setState({ withdraw_address_first: false });
            }
            if (this.state.options_is_valid === true) {
                this.setState({ options_is_valid: false });
            }
        }
    }

    getWithdrawModalId() {
        return "confirmation";
    }

    onAccountBalance() {
        const { feeAmount } = this.state;
        if (Object.keys(this.props.account.get("balances").toJS()).includes(this.props.asset.get("id"))) {
            let total = new Asset({
                amount: this.props.balance.get("balance"),
                asset_id: this.props.asset.get("id"),
                precision: this.props.asset.get("precision")
            });

            // Subtract the fee if it is using the same asset
            if (total.asset_id === feeAmount.asset_id) {
                total.minus(feeAmount);
            }

            this.setState({
                withdraw_amount: total.getAmount({ real: true }),
                empty_withdraw_value: false
            }, this._checkBalance);
        }
    }

    setNestedRef(ref) {
        this.nestedRef = ref;
    }

    onFeeChanged({ asset }) {
        this.setState({
            fee_asset_id: asset.get("id")
        }, this._updateFee);
    }

    _getAvailableAssets(state = this.state) {
        const { from_account, feeStatus } = state;
        function hasFeePoolBalance(id) {
            if (feeStatus[id] === undefined) return true;
            return feeStatus[id] && feeStatus[id].hasPoolBalance;
        }

        function hasBalance(id) {
            if (feeStatus[id] === undefined) return true;
            return feeStatus[id] && feeStatus[id].hasBalance;
        }

        let fee_asset_types = [];
        if (!(from_account && from_account.get("balances"))) {
            return { fee_asset_types };
        }
        let account_balances = state.from_account.get("balances").toJS();
        fee_asset_types = Object.keys(account_balances).sort(utils.sortID);
        for (let key in account_balances) {
            let asset = ChainStore.getObject(key);
            let balanceObject = ChainStore.getObject(account_balances[key]);
            if (balanceObject && balanceObject.get("balance") === 0) {
                if (fee_asset_types.indexOf(key) !== -1) {
                    fee_asset_types.splice(fee_asset_types.indexOf(key), 1);
                }
            }

            if (asset) {
                // Remove any assets that do not have valid core exchange rates
                if (asset.get("id") !== "1.3.0" && !utils.isValidPrice(asset.getIn(["options", "core_exchange_rate"]))) {
                    fee_asset_types.splice(fee_asset_types.indexOf(key), 1);
                }
            }
        }

        fee_asset_types = fee_asset_types.filter(a => {
            return hasFeePoolBalance(a) && hasBalance(a);
        });

        return { fee_asset_types };
    }

    _openInNewTab(url) {
      var win = window.open(url, '_blank');
      if(win)
        win.focus();
    }

    renderBottomTextBlock() {
        let coinSettings = this.state.easydexAssetSettings;
        if(coinSettings) {
            let locStr = "gateway.withdraw_popup_bottom_text." + coinSettings.backingCoinType;

            switch(coinSettings.symbol) {
                case "EASYDEX.BTC":
                    return (
                        <div>
                            <Translate component="span" content={locStr} />
                            <br />
                            <Translate component="span" content="gateway.tool_to_predict"/>
                            <a style={{ paddingBottom: 0 }} href="#" onClick={(e)=>{ window.open('https://bitcoinfees.earn.com','_blank');}} >https://bitcoinfees.earn.com</a>
                        </div>
                    );
                case "EASYDEX.STEEM": case "EASYDEX.SBD":
                    return (
                        <div>
                            <Translate component="span" content={locStr} />
                        </div>
                    );
                default:
                    return null;
            }
        }
    }

    render() {
        let { withdraw_address_selected, memo } = this.state;
        let storedAddress = WithdrawAddresses.get(this.props.output_wallet_type);
        let balance = null;

        let account_balances = this.props.account.get("balances").toJS();
        let asset_types = Object.keys(account_balances);

        let withdrawModalId = this.getWithdrawModalId();
        let invalid_address_message = null;
        let options = null;
        let confirmation = null;
        let invalidMinerFeeMessage = null;

        if (this.state.options_is_valid) {
            options =
                <div className={!storedAddress.length ? "blocktrades-disabled-options" : "blocktrades-options"}>
                    {storedAddress.map(function (name, index) {
                        return <a key={index} onClick={this.onSelectChanged.bind(this, index)}>{name}</a>;
                    }, this)}
                </div>;
        }
        if (this.state.minerFee) {
          if(!this.state.isValidMinerFee) {
            invalidMinerFeeMessage =
                <div className="has-error" style={{ paddingTop: 10 }}>
                    <Translate content="gateway.valid_miner_fee" minFee={withdrawFees[this.props.output_coin_name].minerFee.DEFAULT_MINER_FEE.toFixed(this.props.asset.get("precision"))}/>
                </div>;
          }
        }
        // CONFIRMATION MODAL or ERROR MESSAGE
        if (!this.state.withdraw_address_check_in_progress && (this.state.withdraw_address && this.state.withdraw_address.length)) {
            if (!this.state.withdraw_address_is_valid) {

                invalid_address_message = <div className="has-error" style={{ paddingTop: 10 }}><Translate content="gateway.valid_address" coin_type={this.props.output_coin_type} /></div>;
                confirmation =
                    <Modal id={withdrawModalId} overlay={true}>
                        <Trigger close={withdrawModalId}>
                            <a href="#" className="close-button">&times;</a>
                        </Trigger>
                        <br />
                        <label><Translate content="modal.confirmation.title" /></label>
                        <br />
                        <div className="content-block">
                            <input type="submit" className="button"
                                onClick={this.onSubmitConfirmation.bind(this)}
                                value={counterpart.translate("modal.confirmation.accept")} />
                            <Trigger close={withdrawModalId}>
                                <a href className="secondary button"><Translate content="modal.confirmation.cancel" /></a>
                            </Trigger>
                        </div>
                    </Modal>;
            }
        }

        let tabIndex = 1;

        // Estimate fee VARIABLES
        let { fee_asset_types } = this._getAvailableAssets();

        if (asset_types.length > 0) {
            let current_asset_id = this.props.asset.get("id");
            if (current_asset_id) {
                let current = account_balances[current_asset_id];
                balance = (
                    <span style={{ borderBottom: "#A09F9F 1px dotted", cursor: "pointer" }}>
                        <Translate component="span" content="transfer.available" />&nbsp;:&nbsp;
                        <span className="set-cursor" onClick={this.onAccountBalance.bind(this)}>
                            {current ? <BalanceComponent balance={account_balances[current_asset_id]} /> : 0}
                        </span>
                    </span>
                );
            }
            else
                balance = "No funds";
        } else {
            balance = "No funds";
        }

        let bottomTextBlock = this.renderBottomTextBlock();
        let activeCoinId = this.props.asset.get("id");
        let coinSettings = this.state.easydexAssetSettings;

        let feeLabel = null;
        if(coinSettings) {
            feeLabel = coinSettings.feeType === "gate" ? <label className="left-label"><Translate content="gateway.fee" /></label> :
              <label className="left-label"><Translate content="gateway.miner_fee" /></label>
        }

        const disableSubmit =
            this.state.error ||
            this.state.balanceError ||
            !this.state.withdraw_amount ||
            !this.state.isValidMinerFee ||
            !this.state.isValidWithdrawAmount || //TODO UNCOMMENT THIS LINE AFTER TESTING, COMMENT FOR TESTING
            !this.state.withdraw_address ;

        return (<form className="grid-block vertical full-width-content">
            <div className="grid-container">
                <div className="content-block">
                    <h3><Translate content="gateway.withdraw_coin" coin={this.props.output_coin_name} symbol={this.props.output_coin_symbol} /></h3>
                </div>

                {/* Withdraw amount */}
                <div className="content-block">
                    <AmountSelector label="modal.withdraw.amount"
                        amount={this.state.withdraw_amount}
                        asset={this.props.asset.get("id")}
                        assets={[this.props.asset.get("id")]}
                        placeholder=""
                        onChange={this.onWithdrawAmountChange.bind(this)}
                        display_balance={balance}
                    />
                    { !this.state.isValidWithdrawAmount ? <p className="has-error no-margin" style={{ paddingTop: 10 }}><Translate content="transfer.errors.valid_withdraw_amount" w_amount={parseFloat(this.state.minimalWithdraw).toFixed(coinSettings.pointPrecision)} />
                    </p> : null}
                    {this.state.empty_withdraw_value ? <p className="has-error no-margin" style={{ paddingTop: 10 }}><Translate content="transfer.errors.valid" />
                    </p> : null}
                    {this.state.balanceError ? <p className="has-error no-margin" style={{ paddingTop: 10 }}><Translate content="transfer.errors.insufficient" />
                        <span style={{ marginLeft: 5 }}> (<Translate content="transfer.errors.valid_with_fee" /> {parseFloat(this.state.minimalWithdraw).toFixed(8)} {this.props.output_coin_name}) + <Translate content="gateway.miner_fee" /> </span></p> : null}
                </div>

                {/* Fee selection */}
                {this.state.feeAmount ? <div className="content-block gate_fee">
                    <AmountSelector
                        refCallback={this.setNestedRef.bind(this)}
                        label="transfer.fee"
                        disabled={true}
                        amount={this.state.feeAmount.getAmount({ real: true })}
                        onChange={this.onFeeChanged.bind(this)}
                        asset={this.state.feeAmount.asset_id}
                        assets={fee_asset_types}
                        tabIndex={tabIndex++}
                    />
                    {!this.state.hasBalance ? <p className="has-error no-margin" style={{ paddingTop: 10 }}><Translate content="transfer.errors.noFeeBalance" /></p> : null}
                    {!this.state.hasPoolBalance ? <p className="has-error no-margin" style={{ paddingTop: 10 }}><Translate content="transfer.errors.noPoolBalance" /></p> : null}
                </div> : null}

                {/* Miner fee */}
                {this.props.gateFee ?
                    (<div className="amount-selector right-selector gate_fee" style={{ paddingBottom: 20 }}>
                        {feeLabel}
                        <div className="inline-label input-wrapper">
                            <input
                              type="text"
                              value={this.state.minerFee}
                              onChange={this._onChangeMinerFee.bind(this)}
                              disabled={!!coinSettings.disableGateFeeField}
                            />

                            <div className="form-label select floating-dropdown">
                                <div className="dropdown-wrapper inactive">
                                    <div>{this.props.output_coin_symbol}</div>
                                </div>
                            </div>
                        </div>
                      {invalidMinerFeeMessage}
                    </div>) : null}

                {/* Withdraw Address*/}
                <div className="content-block">
                    <label className="left-label">
                        <Translate component="span" content="modal.withdraw.address" />
                    </label>
                    <div className="blocktrades-select-dropdown">
                        <div className="inline-label">
                            <input type="text" value={withdraw_address_selected} tabIndex="4" onChange={this.onWithdrawAddressChanged.bind(this)} autoComplete="off" />
                            <span onClick={this.onDropDownList.bind(this)} >&#9660;</span>
                        </div>
                    </div>
                    <div className="blocktrades-position-options">
                        {options}
                    </div>
                    {coinSettings.validateAddress
                      ? invalid_address_message
                      :
                      <div className="has-error" style={{ paddingTop: 10 }}>
                          <Translate content="gateway.please_enter_correct_withdraw_address" />
                      </div>
                    }
                    {/*{invalid_address_message}*/}
                </div>

                {/*  M E M O  */}
                <div className="content-block">
                    {
                      coinSettings && coinSettings.displayMemoField && coinSettings.displayMemoField===true ?
                        <div>
                            <label className="left-label">
                                <Translate component="span" content="transfer.memo" />
                            </label>
                            <div className="blocktrades-select-dropdown">
                                <div className="inline-label">
                                      <textarea rows="1" value={this.state.memo} tabIndex="5" onChange={this.onMemoChanged.bind(this)} />
                                </div>
                            </div>
                        </div>
                        : null
                    }
                    {bottomTextBlock}
                </div>
                {/* Withdraw/Cancel buttons */}
                <div className="button-group">

                    <div onClick={this.proceedWithUnlocked.bind(this)} className={"button" + (disableSubmit ? (" disabled") : "")}>
                        <Translate content="modal.withdraw.submit" />
                    </div>

                    <Trigger close={this.props.modal_id}>
                        <div className="button"><Translate content="account.perm.cancel" /></div>
                    </Trigger>
                </div>
                {confirmation}
            </div>
        </form>
        );
    }
};

export default BindToChainState(WithdrawModalBlocktrades, { keep_updating: true });
