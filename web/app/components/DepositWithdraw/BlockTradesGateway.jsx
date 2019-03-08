import React from "react";
import BlockTradesGatewayDepositRequest from "../DepositWithdraw/blocktrades/BlockTradesGatewayDepositRequest";
import Translate from "react-translate-component";
import { connect } from "alt-react";
import SettingsStore from "stores/SettingsStore";
import SettingsActions from "actions/SettingsActions";
import { RecentTransactions, TransactionWrapper } from "components/Account/RecentTransactions";
import {getEasyDexDepositAddress} from "common/blockTradesMethods";
import LinkToAccountById from "components/Blockchain/LinkToAccountById";
import AccountBalance from "../Account/AccountBalance";
import Immutable from "immutable";
import cnames from "classnames";
import LoadingIndicator from "../LoadingIndicator";

class BlockTradesGateway extends React.Component {
    constructor(props) {
        super();

        const action = props.viewSettings.get(`${props.provider}Action`, "deposit");
        this.state = {
            activeCoin: this._getActiveCoin(props, {action}),
            action,
            loading: false,
            emptyAddressDeposit: true,
            receivedAddress: null
        };
      this.addDepositAddress = this.addDepositAddress.bind(this);
    }

    _getActiveCoin(props, state) {
        let cachedCoin = props.viewSettings.get(`activeCoin_${props.provider}_${state.action}`, null);
        let firstTimeCoin = null;
        // if ((props.provider == 'blocktrades') && (state.action == 'deposit')) {
        //   firstTimeCoin = 'BTC';
        // }
        // if ((props.provider == 'openledger') && (state.action == 'deposit')) {
        //   firstTimeCoin = 'BTC';
        // }
        if ((props.provider == 'easy-dex') && (state.action == 'deposit')) {
          firstTimeCoin = 'BTC';
        }
        // if ((props.provider == 'blocktrades') && (state.action == 'withdraw')) {
        //   firstTimeCoin = 'TRADE.BTC';
        // }
        // if ((props.provider == 'openledger') && (state.action == 'withdraw')) {
        //   firstTimeCoin = 'OPEN.BTC';
        // }
        if ((props.provider == 'easy-dex') && (state.action == 'withdraw')) {
          firstTimeCoin = 'EASYDEX.BTC';
        }
        let activeCoin = cachedCoin ? cachedCoin : firstTimeCoin;

        return activeCoin;
    }

  componentDidMount() {
    let coin = this._getCoinObject();
    //console.log("1 Coin:: ",coin);
    if(coin.addressType !== "account_memo") {
      getEasyDexDepositAddress({coin: this.state.activeCoin,  account: this.props.account.get("name"),  stateCallback: this.addDepositAddress})
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.provider !== this.props.provider) {
      this.setState({
        activeCoin: this._getActiveCoin(nextProps, this.state.action)
      });
    }
  }

  _getFilteredCoins(coins){
    let filteredCoins = coins.filter(a => {
      if (!a || !a.symbol) {
        return false;
      } else {
        return true;
      }
    });

    return filteredCoins;
  }

  _getSortedAndFilterdCoins(filteredCoins){
    if(!filteredCoins) {
      return null;
    }
    let sortedCoins = filteredCoins.sort((e1,e2)=>{
      if(!e1.coinPriora&&!e1.coinPriora){
        return 0;
      }
      return e1.coinPriora-e2.coinPriora;
    });

    return sortedCoins;
  }

  _getCoinObject() {
    //console.log("props.coins: ", this.props.coins);
    let sortedAndFilterdCoins = this._getSortedAndFilterdCoins( this._getFilteredCoins(this.props.coins) );
    let { activeCoin, action } = this.state;

    let coin = null;
    if(sortedAndFilterdCoins) {
      coin = sortedAndFilterdCoins.filter(coin => {
        return (action === "deposit" ? coin.backingCoinType.toUpperCase() === activeCoin : coin.symbol === activeCoin);
      })[0];
    }
    return coin ? coin : null;
  }

  addDepositAddress( receive_address ) {
    if(receive_address.error){
      receive_address.error.message == 'no_address' ? this.setState({emptyAddressDeposit: true}) : this.setState({emptyAddressDeposit: false})
    }
    this.setState( {receivedAddress: receive_address ? receive_address : null, loading: false} );

  }


    onSelectCoin(e) {
        this.setState({
            activeCoin: e.target.value
        });

        let setting = {};
        setting[`activeCoin_${this.props.provider}_${this.state.action}`] = e.target.value;
        SettingsActions.changeViewSetting(setting);
        getEasyDexDepositAddress({coin: e.target.value,  account: this.props.account.get("name"),  stateCallback: this.addDepositAddress})

    }

    changeAction(type) {

        let activeCoin = this._getActiveCoin(this.props, {action: type});


        this.setState({
            action: type,
            activeCoin: activeCoin
        });

        SettingsActions.changeViewSetting({[`${this.props.provider}Action`]: type});
    }

    requestDepositAddressLoad(){
        //console.log("this.props.coins: ",this.props.coins);
        const memo_key = this.props.account.get("options").get("memo_key");
        const account_name = this.props.account.get("name");
        //console.log("memo_key: ", memo_key);
        //console.log("account name: ", account_name);
        //console.log("this.props.account.toJS(): ",this.props.account.toJS());
      //this.props.account
        this.setState({
          loading: true,
          emptyAddressDeposit: false
        });
        //requestDepositAddress(this._getDepositObject())
    }


    toClipboard(clipboardText) {
        try {
            this.setState({clipboardText}, () => {
              document.execCommand("copy");
            });
        } catch(err) {
            console.error(err);
        }
    }

    _renderAddressSection(coin, issuer) {
      let {receivedAddress } = this.state;
      let addrBlock = null;

      if(coin.addressType === "account_memo") {
        let {account} = this.props;
        addrBlock =
          <tbody>
            <tr>
              <td><Translate content="gateway.send_to_address" asset={coin.name} /></td>
              <td style={{color: "#5c9be5"}}>{coin.addressSendTo}</td>
            </tr>
            <tr>
              <td>Memo:</td>
              <td style={{color: "#5c9be5"}}>{account.get("name")}</td>
            </tr>
          </tbody>
      }
      else if (coin.addressType ==="api") {
        let address = receivedAddress && receivedAddress.address ? receivedAddress.address : null;;
        addrBlock =
          <tbody>
            <tr>
              <td><Translate content="gateway.send_to_address" asset={coin.name} /></td>
              <td style={{color: "#5c9be5"}}>{address}</td>
            </tr>
          </tbody>
      }
      return (
        <table className="table">
          {addrBlock}
        </table>
      );
    }

    render() {
        let {coins, account, provider} = this.props;
        let {activeCoin, action} = this.state;
        if (!coins.length) {

            return <LoadingIndicator />;
        }

        let filteredCoins = this._getFilteredCoins(coins);
        filteredCoins = this._getSortedAndFilterdCoins(filteredCoins);

        let coinOptions = filteredCoins.map(coin => {
            let option = action === "deposit" ? coin.backingCoinType.toUpperCase() : coin.symbol;
            return <option value={option} key={coin.symbol}>{option}</option>;
        }).filter(a => {
            return a !== null;
        });

        let coin = filteredCoins.filter(coin => {
            return (action === "deposit" ? coin.backingCoinType.toUpperCase() === activeCoin : coin.symbol === activeCoin);
        })[0];

        if (!coin) coin = filteredCoins[0];
        //console.log('@>coin: ',coin);

        let issuers = {
            'easy-dex': {name: coin.intermediateAccount, id: "1.2.459605", support: "support@easydex.net"}
        };

        let issuer = issuers[provider];
        let isDeposit = this.state.action === "deposit";

        let addrSection = this._renderAddressSection(coin, issuer);

        return (

            <div style={this.props.style}>
                <div className="grid-block no-margin vertical medium-horizontal no-padding ">
                    {/*SELECT ASSET*/}
                    <div className="medium-4">
                        <div>
                            <label style={{minHeight: "2rem"}} className="left-label"><Translate content={"gateway.choose_" + action} />: </label>
                            <select
                                className="external-coin-types bts-select"
                                onChange={this.onSelectCoin.bind(this)}
                                value={activeCoin}
                            >
                                {coinOptions}
                            </select>
                        </div>
                    </div>
                    {/*DEPOSIT/WITHDRAW BUTTONS*/}
                    <div className="medium-6 medium-offset-1">
                        <label style={{minHeight: "2rem"}} className="left-label"><Translate content="gateway.gateway_text" />:</label>
                        <div style={{paddingBottom: 15}}>
                            <ul className="button-group segmented no-margin">
                            <li className={action === "deposit" ? "is-active" : ""}><a onClick={this.changeAction.bind(this, "deposit")}><Translate content="gateway.deposit" /></a></li>
                            <li className={action === "withdraw" ? "is-active" : ""}><a onClick={this.changeAction.bind(this, "withdraw")}><Translate content="gateway.withdraw" /></a></li>
                            </ul>
                        </div>
                    </div>
                  { //GET ADDRESS SECTION
                      //DEPOSIT SECTION
                      this.state.action === 'deposit'?
                        <div className="grid-block no-margin vertical medium-horizontal no-padding ">
                          <div className="small-12 medium-4">
                            <table className="table">
                              <tbody>
                              <tr>
                                <Translate component="td" content="gateway.asset_to_deposit" />
                                <td style={{fontWeight: "bold", color: "#4A90E2", textAlign: "right"}}>
                                  {coin.name}
                                </td>
                              </tr>
                              <tr>
                                <Translate component="td" content="gateway.asset_to_receive" />
                                <td style={{fontWeight: "bold", color: "#4A90E2", textAlign: "right"}}>
                                  {coin.symbol}
                                  </td>
                              </tr>
                              <tr>
                                <Translate component="td" content="gateway.intermediate" />
                                <td style={{fontWeight: "bold", color: "#4A90E2", textAlign: "right"}}>
                                  <LinkToAccountById account={issuer.id} />
                                </td>
                              </tr>
                              <tr>
                                <td><Translate content="gateway.balance" />:</td>
                                <td style={{fontWeight: "bold", color: "#4A90E2", textAlign: "right"}}>
                                  <AccountBalance
                                    account={account.get("name")}
                                    asset={coin.symbol}
                                    replace={false}
                                  />
                                </td>
                              </tr>
                              </tbody>
                            </table>
                          </div>


                          <div style={{padding: "10px 0", fontSize: "1.1rem", fontWeight: "bold"}} className="small-12 medium-7 medium-offset-1">
                            <div style={{padding: "10px 0", fontSize: "1.1rem", fontWeight: "bold", color: "red"}} className="small-12 medium-12 ">
                              <table className="table">
                                <tbody>
                                  <tr>
                                    <td><Translate content="gateway.minimal_deposit" minDeposit={coin.minimalDeposit} /></td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                            {/*ADDRESS BLOCK*/}
                            <div style={{padding: "10px 0", fontSize: "1.1rem", fontWeight: "bold"}} className="medium-12 ">
                              {addrSection}
                            </div>
                          </div>
                        </div>
                        : null
                  }
                </div>

                {!coin ? null :
                <div>

                    {/*DEPOSIT or WITHDRAW SECTION*/}
                    <div style={{marginBottom: 15}}>
                        <BlockTradesGatewayDepositRequest
                            key={`${provider}.${coin.symbol}`}
                            gateway={provider}
                            issuer_account={issuer}
                            account={account}
                            deposit_asset={coin.backingCoinType.toUpperCase()}
                            deposit_asset_name={coin.name}
                            deposit_coin_type={coin.backingCoinType.toLowerCase()}
                            deposit_account={coin.depositAccount}
                            deposit_wallet_type={coin.walletType}
                            gateFee={coin.gateFee}
                            minimalWithdraw={coin.minimalWithdraw}
                            receive_asset={coin.symbol}
                            receive_coin_type={coin.symbol.toLowerCase()}
                            supports_output_memos={coin.supportsMemos}
                            action={this.state.action}
                            coinOptions={coin}
                        />
                    </div>

                    {coin && coin.symbol ?
                    <TransactionWrapper
                        asset={coin.symbol}
                        fromAccount={
                            isDeposit ? (issuer.id) :
                            this.props.account.get("id")
                        }
                        to={
                            isDeposit ? ( this.props.account.get("id") ) :
                            (issuer.id)
                        }

                    >
                        {/*RECENT DEPOSITS SECTION*/}
                        { ({asset, to, fromAccount}) => {
                            {/*return <RecentTransactions*/}
                                {/*accountsList={Immutable.List([this.props.account.get("id")])}*/}
                                {/*limit={10}*/}
                                {/*compactView={true}*/}
                                {/*fullHeight={true}*/}
                                {/*filter="transfer"*/}
                                {/*title={<Translate content={"gateway.recent_" + this.state.action} />}*/}
                                {/*customFilter={{*/}
                                    {/*fields: ["to", "from", "asset_id"],*/}
                                    {/*values: {*/}
                                        {/*to: to.get("id"),*/}
                                        {/*from: fromAccount.get("id") ,*/}
                                        {/*asset_id: asset.get("id")*/}
                                    {/*}*/}
                                {/*}}*/}
                            {/*/>;*/}
                        }
                        }
                    </TransactionWrapper> : null}
                </div>
                }
            </div>
        )
    }
}

export default connect(BlockTradesGateway, {
    listenTo() {
        return [SettingsStore];
    },
    getProps() {
        return {
            viewSettings: SettingsStore.getState().viewSettings
        };
    }
});
