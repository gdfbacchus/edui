import React from "react";
import Translate from "react-translate-component";
import ChainTypes from "components/Utility/ChainTypes";
import BindToChainState from "components/Utility/BindToChainState";
import WalletDb from "stores/WalletDb";
import BaseModal from "../../Modal/BaseModal";
import Trigger from "react-foundation-apps/src/trigger";
import ZfApi from "react-foundation-apps/src/utils/foundation-api";
import AccountBalance from "../../Account/AccountBalance";
import BalanceComponent from "components/Utility/BalanceComponent";
import DepositFiatOpenLedger from "./DepositFiatOpenLedger";
import WithdrawFiatOpenLedger from "./WithdrawFiatOpenLedger";
import counterpart from "counterpart";

class OpenLedgerFiatDepositWithdrawCurrency extends React.Component {
  static propTypes = {
    url: React.PropTypes.string,
    gateway: React.PropTypes.string,
    deposit_coin_type: React.PropTypes.string,
    deposit_asset_name: React.PropTypes.string,
    deposit_account: React.PropTypes.string,
    receive_coin_type: React.PropTypes.string,
    account: ChainTypes.ChainAccount,
    issuer_account: ChainTypes.ChainAccount,
    deposit_asset: React.PropTypes.string,
    receive_asset: ChainTypes.ChainAsset,
    deposit_allowed: React.PropTypes.bool,
    withdraw_allowed: React.PropTypes.bool
  };

  constructor(props) {
    super(props);
    this.state = {};
  }

  getWithdrawModalId() {
    return "withdraw_fiat_openledger_" + this.props.receive_asset.get('symbol');
  }

  getDepositModalId() {
    return "deposit_fiat_openledger_" + this.props.receive_asset.get('symbol');
  }

  onWithdraw() {
    ZfApi.publish(this.getWithdrawModalId(), "open");
  }

  onDeposit() {
    ZfApi.publish(this.getDepositModalId(), "open");
  }

  render() {
    if (!this.props.account || !this.props.issuer_account || !this.props.receive_asset)
      return <tr style={{display: "none"}}>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
      </tr>;

    let wallet = WalletDb.getWallet();
    let account_balances_object = this.props.account.get("balances");

    let balance = "0 " + this.props.receive_asset.get('symbol');

    let account_balances = account_balances_object.toJS();
    let asset_types = Object.keys(account_balances);
    if (asset_types.length > 0) {
      let current_asset_id = this.props.receive_asset.get('id');
      if (current_asset_id)
        balance = (<span><Translate component="span" content="transfer.available"/>: <BalanceComponent
          balance={account_balances[current_asset_id]}/></span>);
    }

    let deposit_modal_id = this.getDepositModalId();
    let withdraw_modal_id = this.getWithdrawModalId();

    let deposit_fragment = null;
    if (this.props.deposit_allowed) {
      deposit_fragment =
        <td>
          <button className={"button outline disabled"} onClick={this.onDeposit.bind(this)}><Translate
            content="gateway.deposit"/></button>
          <BaseModal id={deposit_modal_id} overlay={true}>
            <Trigger close={deposit_modal_id}>
              <a href="#" className="close-button">&times;</a>
            </Trigger>
            <br/>
            <div className="grid-block vertical">
              <DepositFiatOpenLedger
                account={this.props.account.get('name')}
                issuer_account={this.props.issuer_account.get('name')}
                receive_asset={this.props.receive_asset.get('symbol')}
                rpc_url={this.props.rpc_url}
                deposit_asset={this.props.deposit_asset}
                modal_id={deposit_modal_id}/>
            </div>
          </BaseModal>
        </td>;
    }
    else
      deposit_fragment =
        <td>{counterpart.translate("simple_trade.click")} <a href="https://openledger.info/v/" rel="noopener noreferrer"
                                                             target="_blank">{counterpart.translate("simple_trade.here")}</a> {counterpart.translate("simple_trade.to_register")} {this.props.deposit_asset}
        </td>;

    let withdraw_fragment = null;
    if (this.props.withdraw_allowed) {
      withdraw_fragment =
        <td>
          <button className={"button outline disabled"} onClick={this.onWithdraw.bind(this)}><Translate
            content="gateway.withdraw"/></button>
          <BaseModal id={withdraw_modal_id} overlay={true}>
            <Trigger close={withdraw_modal_id}>
              <a href="#" className="close-button">&times;</a>
            </Trigger>
            <br/>
            <div className="grid-block vertical">
              <WithdrawFiatOpenLedger
                account={this.props.account.get('name')}
                issuer_account={this.props.issuer_account.get('name')}
                receive_asset={this.props.receive_asset.get('symbol')}
                rpc_url={this.props.rpc_url}
                deposit_asset={this.props.deposit_asset}
                modal_id={withdraw_modal_id}/>
            </div>
          </BaseModal>
        </td>;
    }
    else
      withdraw_fragment =
        <td>{counterpart.translate("simple_trade.click")} <a href="https://openledger.info/v/" rel="noopener noreferrer"
                                                             target="_blank">{counterpart.translate("simple_trade.here")}</a> {counterpart.translate("simple_trade.to_withdrawal")} {this.props.deposit_asset}
        </td>;

    return <tr>
      <td>{ this.props.deposit_asset}</td>
      { deposit_fragment }
      <td><AccountBalance account={this.props.account.get('name')} asset={this.props.receive_asset.get('symbol')}/></td>
      { withdraw_fragment }
    </tr>;
  }
}
; // OpenLedgerFiatDepositWithdrawCurrency
OpenLedgerFiatDepositWithdrawCurrency = BindToChainState(OpenLedgerFiatDepositWithdrawCurrency, {keep_updating: true});

class OpenLedgerFiatDepositWithdrawal extends React.Component {
  static propTypes = {
    rpc_url: React.PropTypes.string,
    account: ChainTypes.ChainAccount,
    issuer_account: ChainTypes.ChainAccount,

  };

  constructor(props) {
    super(props);

    this.state =
      {
        allowedFiatCurrencies: {
          "deposit": [],
          "withdraw": []
        },
        action: 'deposit',
        selectedCurrency: 'USD',
        isVerified: false
      };

    // get approval status from openledger
    let json_rpc_request = {
      "jsonrpc": "2.0",
      "id": 1,
      "method": "isValidatedForFiat",
      "params": {"bitsharesAccountName": this.props.account.get('name')}
    };
    let is_validated_promise = fetch(this.props.rpc_url,
      {
        method: 'POST',
        headers: new Headers({
          "Accept": "application/json",
          "content-type": "application/x-www-form-urlencoded"
        }),
        body: 'rq=' + encodeURIComponent(JSON.stringify(json_rpc_request))
      })
      .then(response => response.json());

    is_validated_promise.then((json_response) => {
      if ('result' in json_response)
        this.setState({allowedFiatCurrencies: json_response.result});
    })
      .catch((error) => {
        this.setState({
          allowedFiatCurrencies: {
            "deposit": [],
            "withdraw": []
          }
        });
      })
  }


  componentWillUnmount() {
    clearInterval(this.update_timer);
  }

  changeAction(type) {
    this.setState({
      action: type,
    });
  }

  onChangeCurrencySelect(event) {
    const currency = event.target.value;
    // console.log("value: ",);
    this.setState({selectedCurrency: currency});
    this.renderFiatTextDescription(currency);
  }

  renderFiatTextDescription(currency) {
    const isVerified = false;//TODO verify current user
    const locStr = isVerified ? 'verified' : 'not_verified';

    if(this.state.action === 'deposit') {
      return (
        <div className="medium-6 show-for-medium help-content" style={{marginTop: "20px"}}>
          <Translate component="p" content={`fiat.content.${currency}.${locStr}.deposit_text_1`}/>
          <div style={{textAlign: "center"}}>
            <Translate component="div" content={`fiat.company_name`}/>
            <br />
            <Translate component="div" content={`fiat.address_1_country`}/>
            <Translate component="div" content={`fiat.address_2_location`}/>
            <Translate component="div" content={`fiat.address_3_addr`}/>
            <br />
            <Translate component="div" content={`fiat.bank_swift`}/>
            <Translate component="div" content={`fiat.content.${currency}.bank_IBAN`}/>
          </div>
          <br />
          <Translate component="p" content={`fiat.content.${currency}.${locStr}.deposit_text_2_0`} style={{color: "red", fontWeight: "700"}}/>
          <Translate component="p" content={`fiat.content.${currency}.${locStr}.deposit_text_2`}/>
          {isVerified === true ?
              <Translate component="div" content={`fiat.support_mail`}/> :
                <Translate component="a" href="https://easydex.net/verification/" target="_blank" content={`fiat.verification_link`}/>}
          <br />
          <br />
          <Translate component="p" content={`fiat.content.${currency}.${locStr}.deposit_text_3`}/>
          <Translate component="div" style={{color: "red"}} content={`fiat.content.${currency}.${locStr}.deposit_text_4`}/>
          <Translate component="a" href="https://www.sanctionsmap.eu/#/main" target="_blank" content={`fiat.sanctions_link`}/>

        </div>
      );
    } else if(this.state.action === 'withdraw') {
      return (
        <div className="medium-6 show-for-medium help-content" style={{marginTop: "20px"}}>
          <Translate component="p" content={`fiat.content.${currency}.${locStr}.withdraw_text_1`}/>
          <Translate component="a" href="https://easydex.net/verification/" target="_blank" content={`fiat.verification_link`}/>
          <br />
        </div>
      );
    } else {
      return null;
    }
  }

  render() {
    let {action, selectedCurrency} = this.state;
    if (!this.props.account || !this.props.issuer_account)
      return <div></div>;

    let fiatContent = this.renderFiatTextDescription(selectedCurrency);

    return <div className="grid-block no-margin vertical medium-horizontal no-padding">
      {/* old fashioned currencies */}
      <div className="medium-4">
        <div>
          <label style={{minHeight: "2rem"}} className="left-label"><Translate content={"fiat.choose_" + action}/>:
          </label>
          <select
            className="external-coin-types bts-select"
            onChange={this.onChangeCurrencySelect.bind(this)}
          >
            <option key={0} value={"USD"}>EASYDEX.US</option>
            <option key={1} value={"EUR"}>EASYDEX.EU</option>
          </select>
        </div>
      </div>
      <div className="medium-6 medium-offset-1">
        <label style={{minHeight: "2rem"}} className="left-label"><Translate content="gateway.gateway_text"/>:</label>
        <div style={{paddingBottom: 15}}>
          <ul className="button-group segmented no-margin">
            <li className={action === "deposit" ? "is-active" : ""}><a
              onClick={this.changeAction.bind(this, "deposit")}><Translate content="gateway.deposit"/></a></li>
            <li className={action === "withdraw" ? "is-active" : ""}><a
              onClick={this.changeAction.bind(this, "withdraw")}><Translate content="gateway.withdraw"/></a></li>
          </ul>
        </div>
      </div>

      {fiatContent}

    </div>
  };
}
; // OpenLedgerFiatDepositWithdrawal
OpenLedgerFiatDepositWithdrawal = BindToChainState(OpenLedgerFiatDepositWithdrawal, {keep_updating: true});

export default OpenLedgerFiatDepositWithdrawal; 