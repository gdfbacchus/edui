import React from "react";
import Translate from "react-translate-component";
import {ChainStore} from "bitsharesjs/es";
import ChainTypes from "components/Utility/ChainTypes";
import BindToChainState from "components/Utility/BindToChainState";
import WithdrawModalBlocktrades from "./WithdrawModalBlocktrades";
import BaseModal from "../../Modal/BaseModal";
import Trigger from "react-foundation-apps/src/trigger";
import ZfApi from "react-foundation-apps/src/utils/foundation-api";
import AccountBalance from "../../Account/AccountBalance";
import BlockTradesDepositAddressCache from "common/BlockTradesDepositAddressCache";
import AssetName from "components/Utility/AssetName";
import LinkToAccountById from "components/Blockchain/LinkToAccountById";
import {requestDepositAddress, getDepositAddress, getLatestTxIds} from "common/blockTradesMethods";
import {blockTradesAPIs} from "api/apiConfig";
import counterpart from "counterpart";
import LoadingIndicator from "components/LoadingIndicator";

//let need_change_address = ["steem","ppy","golos","gbg","sbd","etp","mvs.zgc"]; @#>
let need_change_address = [];

class BlockTradesGatewayDepositRequest extends React.Component {
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
    deposit_wallet_type: React.PropTypes.string,
    receive_asset: ChainTypes.ChainAsset,
    deprecated_in_favor_of: ChainTypes.ChainAsset,
    deprecated_message: React.PropTypes.string,
    action: React.PropTypes.string,
    supports_output_memos: React.PropTypes.bool.isRequired
  };

  static defaultProps = {
    autosubscribe: false
  };

  constructor(props) {
    super(props);
    //this.deposit_address_cache = new BlockTradesDepositAddressCache();

    let urls = {
      blocktrades: blockTradesAPIs.BASE,
      openledger: blockTradesAPIs.BASE_OL
    };

    this.state = {
      receive_address: null,
      url: props.url || urls[props.gateway],
      loading: false,
      emptyAddressDeposit: false,
      loadingLatestTx: false,
      latestTxData: null,
      firstLoadRecentIds: false

    };

    this.addDepositAddress = this.addDepositAddress.bind(this);
    this.setLatestTxIds = this.setLatestTxIds.bind(this);
    this.renderLatestTxData = this.renderLatestTxData.bind(this);
    this._copy = this._copy.bind(this);
    document.addEventListener("copy", this._copy);
  }

  _copy(e) {
    try {
      // e.clipboardData.setData("text/plain", this.state.clipboardText);
      // e.preventDefault();
    } catch (err) {
      console.error(err);
    }
  }

  _getDepositObject() {
    return {
      inputCoinType: this.props.deposit_coin_type,
      outputCoinType: this.props.receive_coin_type,
      outputAddress: this.props.account.get("name"),
      url: this.state.url,
      stateCallback: this.addDepositAddress
    };
  }

  componentWillMount() {
    let account_name = this.props.account.get("name");
    //getDepositAddress({coin: this.props.receive_coin_type,  account: this.props.account.get("name"),  stateCallback: this.addDepositAddress})
    // let receive_address = this.deposit_address_cache.getCachedInputAddress(this.props.gateway, account_name, this.props.deposit_coin_type, this.props.receive_coin_type);

    /*   if (~need_change_address.indexOf(this.props.deposit_coin_type)) {
     setTimeout(()=>{
     requestDepositAddress(this._getDepositObject());
     },1000)
     }*/
  }

  componentWillUnmount() {
    document.removeEventListener("copy", this._copy);
  }

  requestDepositAddressLoad() {
    this.setState({
      loading: true,
      emptyAddressDeposit: false
    })
    requestDepositAddress(this._getDepositObject())
  }

  addDepositAddress(receive_address) {
    if (receive_address.error) {
      receive_address.error.message == 'no_address' ? this.setState({emptyAddressDeposit: true}) : this.setState({emptyAddressDeposit: false})
    }

    let account_name = this.props.account.get("name");
    //   this.deposit_address_cache.cacheInputAddress(this.props.gateway, account_name, this.props.deposit_coin_type, this.props.receive_coin_type, receive_address.address, receive_address.memo);
    this.setState({receive_address});
    this.setState({
      loading: false
    })
  }

  getWithdrawModalId() {
    // console.log( "this.props.issuer: ", this.props.issuer_account.toJS() )
    // console.log( "this.receive_asset.issuer: ", this.props.receive_asset.toJS() )
    //return "withdraw_asset_"+this.props.issuer_account.get("name") + "_"+this.props.receive_asset.get("symbol");
    return "withdraw_asset_ok";
  }

  onWithdraw() {
    ZfApi.publish(this.getWithdrawModalId(), "open");
  }

  toClipboard(clipboardText) {
    try {
      this.setState({clipboardText}, () => {
        document.execCommand("copy");
      });
    } catch (err) {
      console.error(err);
    }
  }

  getlatestTxIds() {
    this.setState({loadingLatestTx: true});
    //console.log("this.props: ", this.props);
    //console.log("account name: ", this.props.account.get("name"));
    //console.log("account id: ", this.props.account.get("id"));
    getLatestTxIds(this.props.coinOptions.easydex_bts_object, this.props.account.get("id"), "withdraw", this.props.coinOptions.walletType, this.setLatestTxIds)


  }

  setLatestTxIds(res) {
    if(res && res.response) {
      let data = res.response;
      //console.log("getlatestTxIds() RESULT: ", data);
      if(this.state.firstLoadRecentIds===false) this.setState({firstLoadRecentIds: true});
      this.setState({loadingLatestTx: false, latestTxData: data});
    }
  }

  renderLatestTxData() {
    let data = this.state.latestTxData;
    //console.log("ROWS DATA: ",data);
    if (data && data.length) {
      let rows = data.map(item => {
        // let address = item.address;
        // let status = item.status;
        let date = item.date;
        let utcDate = new Date(date);
        let localDateTime = utcDate.toLocaleString();
        var localDate= localDateTime.replace(/\//g, '.');

        let txId = item.txid;
        let keyId = item.id + "_" + item.asset;
        return <tr key={keyId}>
          <td style={{padding: "8px 5px", textAlign: "left"}}>
            <div className="grid-block no-padding no-margin">
              <div
                className="small-4 medium-5 large-6"
                style={{color: "#5c9be5", paddingRight: "5px",overflowWrap: "break-word", wordWrap: "break-word"}}
              >
                {item.asset==="1.3.4243" ? item.address : txId}
              </div>

              <div
                className=" small-3 medium-4 large-3"
                title={`${localDate} - DD.MM.YYYY, HH:MM:SS`}
                style={{textAlign: "left" , fontSize: "14px", paddingTop: "5px", overflowWrap: "break-word", wordWrap: "break-word"}}
              >
                {localDate}
              </div>

            </div>
          </td>

        </tr>
      });

      return (
        <div>
          <div className="recent-transactions no-overflow" style={{width: "100%", height: "100%"}}>
            <div className="generic-bordered-box">

              <div className="small-12 medium-12">
                <table className="table compact">
                  <thead>
                    <tr>
                      { this.props.coinOptions.walletType === "eth" ? <th>Address:</th> : <th>TxId:</th> }
                      <th>Date&Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )
    }
    else if((!data || !data.length) && this.state.firstLoadRecentIds===true) {
      return <div style={{paddingTop: "5px"}}>No results found</div>;
    }
    else {return null;}
  }

  render() {
    if(this.props.receive_asset){
      console.log("this.props.receive_asset.get('symbol'): ",this.props.receive_asset.get("symbol")!=='EASYDEX.BTC');
    }
    let emptyRow = <LoadingIndicator />;
    // if( !this.props.account || !this.props.issuer_account || !this.props.receive_asset )
    //     return emptyRow;

    if (!this.props.account) {
      //console.log("!this.props.account: ",!this.props.account);
      //console.log("!this.props.issuer_account: ",!this.props.issuer_account);
      return emptyRow;
    }
    let account_balances_object = this.props.account.get("balances");

    const {gateFee, minimalWithdraw} = this.props;


    if (!this.props.receive_asset) {
      //console.log("EMPTY this.props.receive_asset: ",this.props)
      return emptyRow;
    }
    let balance = "0 " + this.props.receive_asset.get("symbol");

    if (this.props.deprecated_in_favor_of) {
      let has_nonzero_balance = false;
      let balance_object_id = account_balances_object.get(this.props.receive_asset.get("id"));
      if (balance_object_id) {
        let balance_object = ChainStore.getObject(balance_object_id);
        if (balance_object) {
          let balance = balance_object.get("balance");
          if (balance != 0)
            has_nonzero_balance = true;
        }
      }
      if (!has_nonzero_balance)
        return emptyRow;
    }

    // let account_balances = account_balances_object.toJS();
    // let asset_types = Object.keys(account_balances);
    // if (asset_types.length > 0) {
    //     let current_asset_id = this.props.receive_asset.get("id");
    //     if( current_asset_id )
    //     {
    //         balance = (<span><Translate component="span" content="transfer.available"/>: <BalanceComponent balance={account_balances[current_asset_id]}/></span>);
    //     }
    // }

    let receive_address = this.state.receive_address;

    let {emptyAddressDeposit} = this.state;

    let indicatorButtonAddr = this.state.loading;

    if (!receive_address) {
      let account_name = this.props.account.get("name");
      //receive_address = this.deposit_address_cache.getCachedInputAddress(this.props.gateway, account_name, this.props.deposit_coin_type, this.props.receive_coin_type);
    }

    // if( !receive_address ) {
    //   //  requestDepositAddress(this._getDepositObject());
    //     return emptyRow;
    // }

    if (!this.props.issuer_account) {
      //console.log("EMPTY this.props.issuer_account: ")
      //return emptyRow;
    }
    let withdraw_modal_id = this.getWithdrawModalId();

    let deposit_address_fragment = null;
    let deposit_memo = null;
    // if (this.props.deprecated_in_favor_of)
    // {
    //     deposit_address_fragment = <span>please use {this.props.deprecated_in_favor_of.get("symbol")} instead. <span data-tip={this.props.deprecated_message} data-place="right" data-html={true}><Icon name="question-circle" /></span><ReactTooltip /></span>;
    // }
    // else
    // {
    let clipboardText = "";
    let memoText;

    if (this.props.deposit_account) {
      deposit_address_fragment = (<span>{this.props.deposit_account}</span>);
      clipboardText = this.props.receive_coin_type + ":" + this.props.account.get("name");
      deposit_memo = <span>{clipboardText}</span>;
      var withdraw_memo_prefix = this.props.deposit_coin_type + ":";
    }
    else {
      if (receive_address && receive_address.memo) {
        // This is a client that uses a deposit memo (like ethereum), we need to display both the address and the memo they need to send
        memoText = receive_address.memo;
        clipboardText = receive_address.address;
        deposit_address_fragment = (<span>{receive_address.address}</span>);
        deposit_memo = <span>{receive_address.memo}</span>;
      }
      else {
        if (receive_address) {
          // This is a client that uses unique deposit addresses to select the output
          clipboardText = receive_address.address;
          deposit_address_fragment = (<span>{receive_address.address}</span>);
        }
      }
      var withdraw_memo_prefix = "";
    }


    if (this.props.action === "deposit") {
      return <div></div>
      // return (
      //     <div className="Blocktrades__gateway grid-block no-padding no-margin">
      //         <div className="small-12 medium-5">
      //             <Translate component="h4" content="gateway.deposit_summary" />
      //             <div className="small-12 medium-10">
      //                 <table className="table">
      //                     <tbody>
      //                         <tr>
      //                             <Translate component="td" content="gateway.asset_to_deposit" />
      //                             <td style={{fontWeight: "bold", color: "#4A90E2", textAlign: "right"}}>{this.props.deposit_asset}</td>
      //                         </tr>
      //                         <tr>
      //                             <Translate component="td" content="gateway.asset_to_receive" />
      //                             <td style={{fontWeight: "bold", color: "#4A90E2", textAlign: "right"}}><AssetName name={this.props.receive_asset.get("symbol")} replace={false} /></td>
      //                         </tr>
      //                         <tr>
      //                             <Translate component="td" content="gateway.intermediate" />
      //                             <td style={{fontWeight: "bold", color: "#4A90E2", textAlign: "right"}}><LinkToAccountById account={this.props.issuer_account.get("id")} /></td>
      //                         </tr>
      //                         <tr>
      //                             <Translate component="td" content="gateway.your_account" />
      //                             <td style={{fontWeight: "bold", color: "#4A90E2", textAlign: "right"}}><LinkToAccountById account={this.props.account.get("id")} /></td>
      //                         </tr>
      //                         <tr>
      //                             <td><Translate content="gateway.balance" />:</td>
      //                             <td style={{fontWeight: "bold", color: "#4A90E2", textAlign: "right"}}>
      //                                 <AccountBalance
      //                                     account={this.props.account.get("name")}
      //                                     asset={this.props.receive_asset.get("symbol")}
      //                                     replace={false}
      //                                 />
      //                             </td>
      //                         </tr>
      //                     </tbody>
      //                 </table>
      //             </div>
      //         </div>
      //         <div className="small-12 medium-7">
      //             <Translate component="h4" content="gateway.deposit_inst" />
      //             <label className="left-label"><Translate content="gateway.deposit_to" asset={this.props.deposit_asset} />:</label>
      //             <label className="fz_12 left-label"><Translate content="gateway.deposit_notice_delay" /></label>
      //             <div style={{padding: "10px 0", fontSize: "1.1rem", fontWeight: "bold"}}>
      //                 <table className="table">
      //                     <tbody>
      //                         <tr>
      //                             <td>{emptyAddressDeposit ? <Translate content="gateway.please_generate_address" /> : deposit_address_fragment }</td>
      //                         </tr>
      //                         {deposit_memo ? (
      //                         <tr>
      //                             <td>memo: {deposit_memo}</td>
      //                         </tr>) : null}
      //                     </tbody>
      //                 </table>
      //                 <div className="button-group" style={{paddingTop: 10}}>
      //                     {deposit_address_fragment ? <div className="button" onClick={this.toClipboard.bind(this, clipboardText)}>
      //                         <Translate content="gateway.copy_address" />
      //                     </div> : null}
      //                     {memoText ? <div className="button" onClick={this.toClipboard.bind(this, memoText)}>
      //                         <Translate content="gateway.copy_memo" />
      //                     </div> : null}
      //                     <button className={"button spinner-button-circle"} onClick={this.requestDepositAddressLoad.bind(this)}>{indicatorButtonAddr ? <LoadingIndicator type="circle" /> : null}<Translate content="gateway.generate_new" /></button>
      //                 </div>
      //             </div>
      //         </div>
      //     </div>
      // );
    }
    //WITHDRAW SECTION
    else if (this.props.action === "withdraw") {
      let latestTxData = this.renderLatestTxData();
      return (
        <div className="Blocktrades__gateway grid-block no-padding no-margin">
          <div className="small-12 medium-5">
            <Translate component="h4" content="gateway.withdraw_summary"/>
            <div className="small-12 medium-10">
              <table className="table">
                <tbody>
                <tr>
                  <Translate component="td" content="gateway.asset_to_withdraw"/>
                  <td style={{fontWeight: "bold", color: "#4A90E2", textAlign: "right"}}><AssetName
                    name={this.props.receive_asset.get("symbol")} replace={false}/></td>
                </tr>
                <tr>
                  <Translate component="td" content="gateway.asset_to_receive"/>
                  <td style={{fontWeight: "bold", color: "#4A90E2", textAlign: "right"}}>{this.props.deposit_asset}</td>
                </tr>
                <tr>
                  <Translate component="td" content="gateway.intermediate"/>
                  <td style={{fontWeight: "bold", color: "#4A90E2", textAlign: "right"}}><LinkToAccountById
                    account={this.props.issuer_account.get("id")}/></td>
                </tr>
                <tr>
                  <td><Translate content="gateway.balance"/>:</td>
                  <td style={{fontWeight: "bold", color: "#4A90E2", textAlign: "right"}}>
                    <AccountBalance
                      account={this.props.account.get("name")}
                      asset={this.props.receive_asset.get("symbol")}
                      replace={false}
                    />
                  </td>
                </tr>
                </tbody>
              </table>
            </div>

            {/*<p>When you withdraw {this.props.receive_asset.get("symbol")}, you will receive {this.props.deposit_asset} at a 1:1 ratio (minus fees).</p>*/}

          </div>
          {/*WTHDRAW BUTTON*/}
          <div className="small-12 medium-7">
            <Translate component="h4" content="gateway.withdraw_inst"/>

            {/*HIDE BUTTON TEMPORARY*/}

            <div className="grid-block no-padding no-margin">
              {/*DISABLE WITHDRAW BUTTON FOR BTC ONLY!*/}
              {this.props.receive_asset.get("symbol")!=='EASYDEX.BTC' ?
              <div className="small-5 medium-4" style={{paddingTop: 20}}>
                <label className="left-label"><Translate content="gateway.withdraw_to" asset={this.props.deposit_asset}/>:</label>
                <button  className="button success" style={{fontSize: "1.3rem"}} onClick={this.onWithdraw.bind(this)}>
                  <Translate content="gateway.withdraw_now"/>
                </button>

                {/*<label className="left-label"><Translate content="gateway.withdraw_to2" asset={this.props.deposit_asset}/></label>*/}
                {/*<button  className="button success disabled" style={{fontSize: "1.3rem"}} onClick={this.onWithdraw.bind(this)}>*/}
                  {/*<Translate content="gateway.withdraw_now"/></button>*/}
              </div>
                : null}
              {/*//TODO UNCOMMENT TO UNBLOCK*/}
              {
                this.props.coinOptions.addressType === "api"
                  ?
                    <div className=" small-7 medium-8" style={{paddingTop: 20}}>
                      {  this.props.coinOptions.walletType === "eth" ?
                        <label className="left-label"><Translate content="gateway.label_get_recent_eth_dates" />:</label> :
                          <label className="left-label"><Translate content="gateway.label_get_recent_tx_ids" />:</label>
                      }
                      { this.state.loadingLatestTx
                        ?
                        <LoadingIndicator type="three-bounce"/>
                        :
                        <button className="button success" style={{fontSize: "1rem", marginTop: "13px"}}
                                onClick={this.getlatestTxIds.bind(this)}>
                          <Translate content="gateway.btn_get_recent_tx_ids"/>
                        </button>
                      }
                      <div>
                        {latestTxData}
                      </div>
                    </div>
                  :
                    null
              }

            </div>
          </div>
          <BaseModal id={withdraw_modal_id} overlay={true}>
            <br/>
            <div className="grid-block vertical">
              <WithdrawModalBlocktrades
                account={this.props.account.get("name")}
                issuer={this.props.issuer_account.get("name")}
                asset={this.props.receive_asset.get("symbol")}
                url={this.state.url}
                output_coin_name={this.props.deposit_asset_name}
                gateFee={gateFee}
                minimalWithdraw={minimalWithdraw}
                output_coin_symbol={this.props.deposit_asset}
                output_coin_type={this.props.deposit_coin_type}
                output_wallet_type={this.props.deposit_wallet_type}
                output_supports_memos={this.props.supports_output_memos}
                memo_prefix={withdraw_memo_prefix}
                modal_id={withdraw_modal_id}
                balance={this.props.account.get("balances").toJS()[this.props.receive_asset.get("id")]}
                coinOptions={this.props.coinOptions}
              />
            </div>
          </BaseModal>
        </div>
      );
    }
  }
}
;

export default BindToChainState(BlockTradesGatewayDepositRequest, {keep_updating: true});
