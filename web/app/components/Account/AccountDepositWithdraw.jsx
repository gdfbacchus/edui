import React from "react";
import {connect} from "alt-react";
import accountUtils from "common/account_utils";
import utils from "common/utils";
import Translate from "react-translate-component";
import ChainTypes from "../Utility/ChainTypes";
import BindToChainState from "../Utility/BindToChainState";
import TranswiserDepositWithdraw from "../DepositWithdraw/transwiser/TranswiserDepositWithdraw";
import BlockTradesGateway from "../DepositWithdraw/BlockTradesGateway";
import OpenLedgerFiatDepositWithdrawal from "../DepositWithdraw/openledger/OpenLedgerFiatDepositWithdrawal";
import OpenLedgerFiatTransactionHistory from "../DepositWithdraw/openledger/OpenLedgerFiatTransactionHistory";
import BlockTradesBridgeDepositRequest from "../DepositWithdraw/blocktrades/BlockTradesBridgeDepositRequest";
import HelpContent from "../Utility/HelpContent";
import AccountStore from "stores/AccountStore";
import {ChainStore} from "bitsharesjs/es"
import SettingsStore from "stores/SettingsStore";
import SettingsActions from "actions/SettingsActions";
import {Apis} from "bitsharesjs-ws";
import {settingsAPIs, blockTradesAPIs} from "api/apiConfig";
import BitKapital from "../DepositWithdraw/BitKapital";
import GatewayStore from "stores/GatewayStore";
import GatewayActions from "actions/GatewayActions";
import AccountImage from "../Account/AccountImage";
import SimpleDepositWithdraw from "../Dashboard/SimpleDepositWithdraw";
import BaseModal from "../Modal/BaseModal";
import DepositModalRmbpay from "../DepositWithdraw/openledger/DepositModalRmbpay";
import WithdrawModalRmbpay from "../DepositWithdraw/openledger/WithdrawModalRmbpay";
import ZfApi from "react-foundation-apps/src/utils/foundation-api";
import io from 'socket.io-client';

const RMBPAY_ASSET_ID = "1.3.2562"

class AccountDepositWithdraw extends React.Component {

  static propTypes = {
    account: ChainTypes.ChainAccount.isRequired,
    contained: React.PropTypes.bool
  };

  static defaultProps = {
    contained: false
  };

  constructor(props) {
    super();
    this.state = {
      olService: props.viewSettings.get("olService", "gateway"),
      btService: props.viewSettings.get("btService", "bridge"),
      metaService: props.viewSettings.get("metaService", "bridge"),
      activeService: props.viewSettings.get("activeService", 0),
      rmbPay: {
        list_service: [{
          name: "Alipay",
          link_qr_code: ""
        }],
        fees: {
          fee_share_dep: 0.0,
          fee_min_val_dep: 0
        }
      }
    };
    SettingsActions.changeViewSetting({
      activeService: parseInt(0)
    });
  }

  shouldComponentUpdate(nextProps, nextState) {
    return (
      nextProps.account !== this.props.account ||
      // !utils.are_equal_shallow(nextProps.blockTradesBackedCoins, this.props.blockTradesBackedCoins) ||
      !utils.are_equal_shallow(nextProps.easydexBackedCoins, this.props.easydexBackedCoins) ||
      nextState.olService !== this.state.olService ||
      nextState.btService !== this.state.btService ||
      nextState.metaService !== this.state.metaService ||
      nextState.activeService !== this.state.activeService
    );
  }

  componentWillMount() {
    accountUtils.getFinalFeeAsset(this.props.account, "transfer");
  }

  toggleOLService(service) {
    this.setState({
      olService: service
    });

    SettingsActions.changeViewSetting({
      olService: service
    });
  }

  toggleBTService(service) {
    this.setState({
      btService: service
    });

    SettingsActions.changeViewSetting({
      btService: service
    });
  }

  toggleMetaService(service) {
    this.setState({
      metaService: service
    });

    SettingsActions.changeViewSetting({
      metaService: service
    });
  }

  onSetService(e) {
    //let index = this.state.services.indexOf(e.target.value);
    this.setState({
      activeService: parseInt(e.target.value)
    });

    SettingsActions.changeViewSetting({
      activeService: parseInt(e.target.value)
    });
  }

  _showDepositWithdraw(action, asset, fiatModal, e) {
    e.preventDefault();
    this.setState({
      [action === "bridge_modal" ? "bridgeAsset" : action === "deposit_modal" ? "depositAsset" : "withdrawAsset"]: asset,
      fiatModal
    }, () => {
      this.refs[action].show();
    });
  }

  getWithdrawModalId() {
    return "withdraw_asset_openledger-dex_CNY";
  }

  getDepositModalId() {
    return "deposit_asset_openledger-dex_CNY";
  }

  onDeposit() {
    this.depositModalRmbpay.refs.bound_component.onOpen();
    ZfApi.publish(this.getDepositModalId(), "open");
  }

  onWithdraw() {
    this.withdrawModalRmbpay.refs.bound_component.fetchWithdrawData();
    ZfApi.publish(this.getWithdrawModalId(), "open");
  }

  render() {
    let {account} = this.props;
    let {olService, btService} = this.state;

    let {activeService} = this.state;

    let withdraw_modal_id = this.getWithdrawModalId();
    let deposit_modal_id = this.getDepositModalId();

    // let blockTradesGatewayCoins = this.props.blockTradesBackedCoins.filter(coin => {
    //   if (coin.backingCoinType.toLowerCase() === "muse") {
    //     return false;
    //   }
    //   return coin.symbol.toUpperCase().indexOf("TRADE") !== -1;
    // })
    //   .map(coin => {
    //     return coin;
    //   })
    //   .sort((a, b) => {
    //     if (a.symbol < b.symbol)
    //       return -1;
    //     if (a.symbol > b.symbol)
    //       return 1;
    //     return 0;
    //   });

    //console.log("this.props.easydexBackedCoins: ",this.props.easydexBackedCoins);
    let easydexGatewayCoins = this.props.easydexBackedCoins.map(coin => {
      return coin;
    })
      .sort((a, b) => {
        if (a.symbol < b.symbol)
          return -1;
        if (a.symbol > b.symbol)
          return 1;
        return 0;
      });
    //console.log("easydexGatewayCoins: ",easydexGatewayCoins);
    return (
      <div className={this.props.contained ? "grid-content" : "grid-container"}>
        <div className={this.props.contained ? "" : "grid-content"} style={{paddingTop: "2rem"}}>

          <Translate content="gateway.title" component="h2"/>
          <div className="grid-block vertical medium-horizontal no-margin no-padding">
            <div className="medium-6 show-for-medium" style={{paddingTop: "10px"}}>
              <Translate component="span"  content="gateway.text_under_title_1"/>&nbsp;
              <a style={{ paddingBottom: 0 }} href="#" onClick={(e)=>{e.preventDefault(); window.open('https://discord.gg/6KDzQJb','_blank');}} >Discord</a>,&nbsp;&nbsp;
              <a style={{ paddingBottom: 0 }} href="#" onClick={(e)=>{e.preventDefault(); window.open('https://t.me/easydex','_blank');}} >Telegram</a>,&nbsp;&nbsp;
              <Translate component="span"  content="gateway.text_under_title_2"/>&nbsp;&nbsp;
              <a style={{ paddingBottom: 0 }} href="#" onClick={(e)=>{e.preventDefault(); window.open('https://easydex.net/contact-us/','_blank');}} >
                <Translate component="span"  content="gateway.text_under_title_3"/>
              </a>,&nbsp;&nbsp;
              <Translate component="span"  content="gateway.text_under_title_4"/>
            </div>
            <div className="medium-5 medium-offset-1">
              <HelpContent account={account.get("name")} path="components/DepositWithdraw" section="receive"/>
            </div>
          </div>

          <div>
            <div className="grid-block vertical medium-horizontal no-margin no-padding">
              <div className="medium-5 medium-offset-7 small-order-1 medium-order-2" style={{paddingBottom: 20}}>
                <Translate component="label" className="left-label" content="gateway.your_account"/>
                <div className="inline-label">
                  <AccountImage
                    size={{height: 40, width: 40}}
                    account={account.get("name")} custom_image={null}
                  />
                  <input type="text"
                         value={account.get("name")}
                         placeholder={null}
                         disabled
                         onChange={() => {
                         }}
                         onKeyDown={() => {
                         }}
                         tabIndex={1}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="grid-content no-padding" style={{paddingTop: 15}}>
            {/*{activeService && services[activeService] ? services[activeService].template : services[0].template}*/}
            <div className="content-block">
              <div className="service-selector">
                <ul className="button-group segmented no-margin">
                  <li onClick={this.toggleOLService.bind(this, "gateway")}
                      className={olService === "gateway" ? "is-active" : ""}><a><Translate content="gateway.gateway"/></a>
                  </li>
                  <li onClick={this.toggleOLService.bind(this, "fiat")} className={olService === "fiat" ? "is-active" : ""}>
                    <a>Fiat</a></li>
                </ul>
              </div>

              {olService === "gateway" && easydexGatewayCoins.length ?
                <BlockTradesGateway
                  account={account}
                  coins={easydexGatewayCoins}
                  provider="easy-dex"
                /> : null}

              {olService === "fiat" ?
                <div>
                  {/*<div style={{paddingBottom: 15}}><Translate component="h5" content="gateway.fiat_text" unsafe/></div>*/}

                  <OpenLedgerFiatDepositWithdrawal
                    rpc_url={settingsAPIs.RPC_URL}
                    account={account}
                    issuer_account="openledger-fiat"/>
                  {/**/}
                  {/*<OpenLedgerFiatTransactionHistory*/}
                  {/*rpc_url={settingsAPIs.RPC_URL}*/}
                  {/*account={account}/>*/}
                </div> : null}
            </div>
          </div>
        </div>

        <BaseModal id={deposit_modal_id} overlay={true} maxWidth="500px">
          <div className="grid-block vertical">

            <DepositModalRmbpay
              account={this.props.account.get("name")}
              asset="CNY"
              output_coin_name="CNY"
              output_coin_symbol="CNY"
              output_coin_type="cny"
              modal_id={deposit_modal_id}
              ref={modal => {
                this.depositModalRmbpay = modal;
              }}
              /* balance={{'id': 100}}*/
            />
          </div>
        </BaseModal>

        <BaseModal id={withdraw_modal_id} overlay={true} maxWidth="500px">
          <div className="grid-block vertical">
            <WithdrawModalRmbpay
              account={this.props.account.get("name")}
              issuer_account="openledger-fiat"
              asset="RMBPAY"
              output_coin_name="RMBPAY"
              output_coin_symbol="RMBPAY"
              output_coin_type="RMBPAY"
              modal_id={withdraw_modal_id}
              balance={this.props.account.get("balances").toJS()[RMBPAY_ASSET_ID]}
              ref={modal => {
                this.withdrawModalRmbpay = modal;
              }}
            />
          </div>
        </BaseModal>


      </div>



    );
  }
}
;
AccountDepositWithdraw = BindToChainState(AccountDepositWithdraw);

class DepositStoreWrapper extends React.Component {
  constructor() {
    super();
    // this.state = {
    //   ws: null
    // };
  }


  componentWillMount() {
    if (Apis.instance().chain_id.substr(0, 8) === "4018d784") { // Only fetch this when on BTS main net
      GatewayActions.fetchCoins.defer({backer: "EASYDEX"}); // EasyDex

      //GatewayActions.fetchCoins.defer({backer: "OPEN", url: blockTradesAPIs.BASE_OL + blockTradesAPIs.COINS_LIST}); // Openledger
      //GatewayActions.fetchCoins.defer({backer: "TRADE", url: blockTradesAPIs.BASE + blockTradesAPIs.COINS_LIST}); // Blocktrades
    }
    //WebSocket connection
    // const ws = io('http://localhost:8080');
    //
    // ws.on('connect', function(){
    //   console.log("WS-client is connected!");
    // });
    // ws.on('event', function(data){
    //
    // });
    // ws.on('disconnect', function(){
    //   console.log("ws was disconnected");
    // });
    // ws.on('error', (error) => {
    //   console.log("error ws: ",error);
    // });
    //
    // this.setState({ws});
  }

  componentWillUnmount() {
    //this.state.ws.close()// or ws.disconnect();
  }

  render() {
    return <AccountDepositWithdraw /*ws={this.state.ws}*/ {...this.props} />;
  }
}

export default connect(DepositStoreWrapper, {
  listenTo() {
    return [AccountStore, SettingsStore, GatewayStore];
  },
  getProps() {
    return {
      account: AccountStore.getState().currentAccount,
      viewSettings: SettingsStore.getState().viewSettings,
      //openLedgerBackedCoins: GatewayStore.getState().backedCoins.get("OPEN", []),
      //blockTradesBackedCoins: GatewayStore.getState().backedCoins.get("TRADE", [])
      easydexBackedCoins: GatewayStore.getState().backedCoins.get("EASYDEX", []),
      // easydexBackedCoins: [
      //   {
      //     "name":"BTC",
      //     "intermediateAccount":"easy-dex",
      //     "gateFee":"0.00003000",//miner fee
      //     "walletType":"btc",
      //     "backingCoinType":"BTC",
      //     "symbol":"EASYDEX.BTC",
      //     "supportsMemos":false,
      //     "addressType": "api",
      //     "isAvailable":true,
      //     "minimalDeposit": 0.01,
      //     "minimalWithdraw": 0.00100000
      //   },
      //   {
      //     "name":"STEEM",
      //     "intermediateAccount":"easy-dex",
      //     "gateFee":"0",
      //     "walletType":"steem",
      //     "backingCoinType":"STEEM",
      //     "symbol":"EASYDEX.STEEM",
      //     "supportsMemos":true,
      //     "addressType": "account_memo",
      //     "addressSendTo": "easydex-wallet",
      //     "isAvailable":true,
      //     "minimalDeposit": 1,
      //     "minimalWithdraw": 1
      //   },
      //   {
      //     "name":"SBD",
      //     "intermediateAccount":"easy-dex",
      //     "gateFee":"0",
      //     "walletType":"sbd",
      //     "backingCoinType":"SBD",
      //     "symbol":"EASYDEX.SBD",
      //     "supportsMemos":true,
      //     "addressSendTo": "easydex-wallet",
      //     "addressType": "account_memo",
      //     "isAvailable":true,
      //     "minimalDeposit": 1,
      //     "minimalWithdraw": 1
      //   }
      // ],
    };
  }
});