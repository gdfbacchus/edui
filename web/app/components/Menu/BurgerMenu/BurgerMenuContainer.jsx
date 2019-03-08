import React from 'react';
import { Link, Router, Route, IndexRoute, browserHistory, hashHistory } from "react-router/es";
import { connect } from "alt-react";
import Translate from "react-translate-component";
import ReactTooltip from "react-tooltip";
import cnames from "classnames";
import counterpart from "counterpart";
import TotalBalanceValue from "../../Utility/TotalBalanceValue";
//STORES
import AccountStore from "../../../stores/AccountStore";
import SettingsStore from "stores/SettingsStore";
import WalletDb from "stores/WalletDb";
import WalletUnlockStore from "stores/WalletUnlockStore";
import WalletManagerStore from "stores/WalletManagerStore";
import {ChainStore} from "bitsharesjs/es";
//ACTIONS
import AccountActions from "actions/AccountActions";
import WalletUnlockActions from "actions/WalletUnlockActions";
import notify from "actions/NotificationActions";
import IntlActions from "actions/IntlActions";
import SettingsActions from "actions/SettingsActions";
//APIs
import ZfApi from "react-foundation-apps/src/utils/foundation-api";
import { Apis } from "bitsharesjs-ws";
//COMPONENTS
import BurgerMenu from './BurgerMenu';
import MenuItem from './MenuItem';
import BurgerButton from './BurgerButton';
import ActionSheet from "react-foundation-apps/src/action-sheet";
import Icon from "../../Icon/Icon";
import AccountImage from "../../Account/AccountImage";

let logo = '/app/assets/EasyDex-logo-text-white-small.png';

const FlagImage = ({flag, width = 20, height = 20}) => {
  return <img height={height} width={width} src={"/app/assets/language-dropdown/img/" + flag.toUpperCase() + ".png"} />;
};



class BurgerMenuContainer extends React.Component {
  static contextTypes = {
    location: React.PropTypes.object.isRequired,
    router: React.PropTypes.object.isRequired
  };

  constructor(props, context) {
    super();
    this.showMenu = this.showMenu.bind(this);
    this.hideMenu = this.hideMenu.bind(this);
    this.hideMenuA = this.hideMenuA.bind(this);

    this.state = {
      active: context.location.pathname
    };

    this.unlisten = null;

  }

  navigate(hash) {
    if(hash){
      browserHistory.push(hash);
    }
  }

  showMenu() {
    this.refs.left.show();
  }

  hideMenu(hash) {
    this.refs.left.hide();
    this.navigate(hash);
  }

  hideMenuA(event) {
    event.preventDefault();
    this.refs.left.hide();
  }


  componentWillMount() {
    this.unlisten = this.context.router.listen((newState, err) => {
      if (!err) {
        if (this.unlisten && this.state.active !== newState.pathname) {
          this.setState({
            active: newState.pathname
          });
        }
      }
    });
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.traderMode && !this.props.traderMode) {
      this.context.router.push("/dashboard");
    }else if(!nextProps.traderMode && this.props.traderMode){
      this.context.router.push("/dashboard");
    }
  }

  componentDidMount() {
    setTimeout(() => {
      ReactTooltip.rebuild();
    }, 1250);
  }

  componentWillUnmount() {
    if (this.unlisten) {
      this.unlisten();
      this.unlisten = null;
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    return (
      nextProps.linkedAccounts !== this.props.linkedAccounts ||
      nextProps.traderMode !== this.props.traderMode ||
      nextProps.currentAccount !== this.props.currentAccount ||
      nextProps.passwordLogin !== this.props.passwordLogin ||
      nextProps.locked !== this.props.locked ||
      nextProps.current_wallet !== this.props.current_wallet ||
      nextProps.lastMarket !== this.props.lastMarket ||
      nextProps.starredAccounts !== this.props.starredAccounts ||
      nextProps.currentLocale !== this.props.currentLocale ||
      nextState.active !== this.state.active
    );
  }

  _triggerMenu(e) {
    e.preventDefault();
    ZfApi.publish("mobile-menu", "toggle");
  }

  _toggleLock(e) {
    e.preventDefault();
    let airbitzkey = document.querySelector(".airbitzkey");
    if(airbitzkey){
      airbitzkey.setAttribute("show_switch_airbitzkey","true");
    }

    if (WalletDb.isLocked()) {
      WalletUnlockActions.unlock().then(() => {
        AccountActions.tryToSetCurrentAccount();
      });
    } else {
      WalletUnlockActions.lock();
    }
  }

  _onNavigate(route, e) {
    if(e){
      e.preventDefault();
    }
    this.refs.left.hide();
    this.context.router.push(route);
  }

  _onGoBack(e) {
    e.preventDefault();
    window.history.back();
  }

  _onGoForward(e) {
    e.preventDefault();
    window.history.forward();
  }

  _accountClickHandler(account_name, e) {
    e.preventDefault();
    ZfApi.publish("account_drop_down", "close");
    if (this.context.location.pathname.indexOf("/account/") !== -1) {
      let currentPath = this.context.location.pathname.split("/");
      currentPath[2] = account_name;
      this.context.router.push(currentPath.join("/"));
    }
    if (account_name !== this.props.currentAccount) {
      AccountActions.setCurrentAccount.defer(account_name);
      notify.addNotification({
        message: counterpart.translate("header.account_notify", {account: account_name}),
        level: "success",
        autoDismiss: 3
      });
    }
    // this.onClickUser(account_name, e);
  }

  go_with_airbitz(){
    if(!this.props.currentAccount){
      localStorage.setItem("airbitz_backup_option","true")
    }
    //console.log('@>airbitz_backup_option header',localStorage.getItem("airbitz_backup_option"))
  }


  render() {
    let {active} = this.state;
    let {linkedAccounts, currentAccount, starredAccounts, traderMode, passwordLogin} = this.props;
    let locked_tip = counterpart.translate("header.locked_tip");
    let unlocked_tip = counterpart.translate("header.unlocked_tip");

    let tradingAccounts = AccountStore.getMyAccounts();

    if (starredAccounts.size) {
      for (let i = tradingAccounts.length - 1; i >= 0; i--) {
        if (!starredAccounts.has(tradingAccounts[i])) {
          tradingAccounts.splice(i, 1);
        }
      };
      starredAccounts.forEach(account => {
        if (tradingAccounts.indexOf(account.name) === -1) {
          tradingAccounts.push(account.name);
        }
      });
    }


    let myAccounts = AccountStore.getMyAccounts();
    let myAccountCount = myAccounts.length;

    let createAccountLink = myAccountCount === 0 ? (
      <ActionSheet.Button title="" setActiveState={this.go_with_airbitz.bind(this)} >
        <a className="button create-account" onClick={this._onNavigate.bind(this, "/create-account")} style={{ border: "none"}} >
          <Icon className="icon-14px" name="user"/> <Translate content="header.create_account" />
        </a>
      </ActionSheet.Button>
    ) : null;

    let lock_unlock = (
      <div className="grp-menu-item" onClick={this._toggleLock.bind(this)} data-class="unlock-tooltip" data-offset="{'left': 50}" data-tip={this.props.locked ? locked_tip: unlocked_tip} data-place="bottom" data-html>
        <a href onClick={this._toggleLock.bind(this)} data-class="unlock-tooltip" data-offset="{'left': 50}" data-tip={this.props.locked ? locked_tip: unlocked_tip} data-place="bottom" data-html>
          <Icon className="icon-14px" name={ this.props.locked ? "locked" : "unlocked"}/>
        </a>
      </div>
    );

    let hasOrders = linkedAccounts.reduce((final, a) => {
      let account = ChainStore.getAccount(a);
      return final || (account && account.get("orders") && account.get("orders").size > 0);
    }, false);

    // Account selector: Only active inside the exchange
    let accountsDropDown = null, account_display_name, accountsList;
    if (currentAccount) {
      account_display_name = currentAccount.length > 20 ? `${currentAccount.slice(0, 20)}..` : currentAccount;
      if (tradingAccounts.indexOf(currentAccount) < 0) {
        tradingAccounts.push(currentAccount);
      }
      if (tradingAccounts.length >= 1) {
        accountsList = tradingAccounts
          .sort()
          .map((name, index) => {
            return (
              <li className={name === account_display_name ? "current-account" : ""} key={name}>
                <a href onClick={this._accountClickHandler.bind(this, name)}>
                  <div className="table-cell"><AccountImage style={{position: "relative", top: 5}} size={{height: 20, width: 20}} account={name}/></div>
                  <div className="table-cell" style={{paddingLeft: 10}}><span>{name}</span></div>
                </a>
              </li>
            );
          });
      }
    }

    accountsDropDown = createAccountLink ?
      createAccountLink :
      tradingAccounts.length === 1 ?
        (<ActionSheet.Button title="" setActiveState={() => {}}>
          <a onClick={this._accountClickHandler.bind(this, account_display_name)} style={{cursor: "default", border: "none"}} className="button">
            <div className="table-cell"><AccountImage style={{display: "inline-block"}} size={{height: 20, width: 20}} account={account_display_name}/></div>
            <div className="table-cell" style={{paddingLeft: 5, verticalAlign: "middle"}}><div className="inline-block"><span className="lower-case">{account_display_name}</span></div></div>
          </a>
        </ActionSheet.Button>) :

        (<ActionSheet>
          <ActionSheet.Button title="">
            <a style={{ border: "none"}} className="button">
              <div className="table-cell"><AccountImage style={{display: "inline-block"}} size={{height: 20, width: 20}} account={account_display_name}/></div>
              <div className="table-cell" style={{paddingLeft: 5, verticalAlign: "middle"}}><div className="inline-block"><span className="lower-case">{account_display_name}</span></div></div>
            </a>
          </ActionSheet.Button>
          {tradingAccounts.length > 1 ?
            <ActionSheet.Content>
              <ul className="no-first-element-top-border">
                {accountsList}
              </ul>
            </ActionSheet.Content> : null}
        </ActionSheet>);

    let settingsDropdown = <ActionSheet>
      <ActionSheet.Button title="">
        <a style={{border: "none"}} className="button">
          <Icon className="icon-14px" name="cog"/>
        </a>
      </ActionSheet.Button>
      <ActionSheet.Content>
        <ul className="no-first-element-top-border">
          <li>
            <a href onClick={this._onNavigate.bind(this, "/settings")}>
              <span><Translate content="header.settings" /></span>
            </a>
          </li>
          <li>
            <a href onClick={this._onNavigate.bind(this, "/explorer")}>
              <span><Translate content="header.explorer" /></span>
            </a>
          </li>
          <li>
            <a href onClick={this._onNavigate.bind(this, "/help")}>
              <span><Translate content="header.help" /></span>
            </a>
          </li>
        </ul>
      </ActionSheet.Content>
    </ActionSheet>;

    const flagDropdown = <ActionSheet>
      <ActionSheet.Button title="">
        <a style={{ border: "none"}} className="button">
          <FlagImage flag={this.props.currentLocale} />
        </a>
      </ActionSheet.Button>
      <ActionSheet.Content>
        <ul className="no-first-element-top-border">
          {this.props.locales.map(locale => {
            return (
              <li key={locale}>
                <a href onClick={(e) => {e.preventDefault(); IntlActions.switchLocale(locale);}}>
                  <div className="table-cell"><FlagImage flag={locale} /></div>
                  <div className="table-cell" style={{paddingLeft: 10}}><Translate content={"languages." + locale} /></div>

                </a>
              </li>
            );
          })}
        </ul>
      </ActionSheet.Content>
    </ActionSheet>;

    const enableDepositWithdraw = Apis.instance().chain_id.substr(0, 8) === "4018d784";


    let dashboard = (
      <a
        className="burger-menu-logo"
        onClick={this._onNavigate.bind(this, "/explorer")}
      >
        <img style={{margin:0,height: 30}} src={logo} />
      </a>
    );

    let tradeLink = this.props.lastMarket ?
      <MenuItem className={cnames({active: active.indexOf("market/") !== -1})} hash={`/market/${this.props.lastMarket}`} onClick={this.hideMenu}>
        <Translate component="span" content="header.exchange" />
      </MenuItem> :
      <MenuItem className={cnames({active: active.indexOf("market/") !== -1})} hash="/market/USD_BTS" onClick={this.hideMenu}>
        <Translate component="span" content="header.exchange" />
      </MenuItem>;

    let sendLink =
      <MenuItem className={cnames({active: active.indexOf("transfer") !== -1})} hash="transfer" onClick={this.hideMenu}>
        <Translate component="span" content="header.payments" />
      </MenuItem>

    let accountLink = (!currentAccount || !traderMode) ? null :
      <MenuItem className={cnames({active: active.indexOf("account/") !== -1})} hash={`/account/${currentAccount}/overview`} onClick={this.hideMenu}>
        <Translate content="header.account" />
      </MenuItem>;

    let depositWithdraw = (traderMode && currentAccount && myAccounts.indexOf(currentAccount) !== -1) ?
      <MenuItem className={cnames({active: active.indexOf("deposit-withdraw/") !== -1})} hash="/deposit-withdraw/" onClick={this.hideMenu}>
        <Translate content="account.deposit_withdraw"/>
      </MenuItem> : null;

    let walletBalance = myAccounts.length && this.props.currentAccount ? (
      <div className="grp-menu-item header-balance">
        <a><TotalBalanceValue.AccountWrapper label="exchange.balance" accounts={[this.props.currentAccount]} inHeader={true}/></a>
      </div>) : null;
    let walletBalanceL = !myAccountCount || !walletBalance ? null :
      <MenuItem onClick={this.hideMenu}>{walletBalance}</MenuItem>;

    //@#>
    let login_with_password = myAccountCount === 0 ? (
      <Link className="button create-account"
            to="/login"
            style={{border: "none"}} >
        <Icon className="icon-14px" name="key"/> <Translate content="header.login" />
      </Link>
    ) : null;

    let login_with_passwordLink = myAccountCount === 0 ?
      (
        <MenuItem onClick={this._onNavigate.bind(this, "/login")}>
          {login_with_password}
        </MenuItem>
      ) : null;

    let accountsDropDownLink =
      <MenuItem firstItem={true} onClick={this._onNavigate.bind(this, "/create-account")}>
        <div className="grp-menu-item overflow-visible account-drop-down">
          {accountsDropDown}
        </div>
      </MenuItem>;

    let lock_unlockLink = !myAccountCount ? null :
      <MenuItem onClick={this.hideMenu}>
        {lock_unlock}
      </MenuItem>

    let flagDropdownLink = !myAccountCount ? null : flagDropdown;
    let flagDropdownLinkWhenAccountGr = myAccountCount !== 0 ? null : flagDropdown;

    return (
      <div className="left-nav-bar-wrapper">
        <div className="block-list">
          <BurgerButton className="burgerBtn" onClick={this.showMenu}>Show Left Menu!</BurgerButton>
          <BurgerMenu ref="left" alignment="left">
            <a id="closeBurgerMenu"  onClick={this.hideMenuA}>×</a>
            { dashboard }
            {flagDropdownLink}
            {flagDropdownLinkWhenAccountGr}
            {accountsDropDownLink}
            {lock_unlockLink}
            {login_with_passwordLink}
            {sendLink}
            {tradeLink}
            {accountLink}
            {depositWithdraw}
            <MenuItem hash="settings" onClick={this.hideMenu}>Settings</MenuItem>
            <MenuItem hash="explorer" onClick={this.hideMenu}>Explore</MenuItem>
            {walletBalanceL}
            <MenuItem hash="help" onClick={this.hideMenu}>Help</MenuItem>
            <a className="left-nav-support-link" target="_blank" href="https://easydex.net" >easydex.net</a>
            <a className="left-nav-support-link" href="https://easydex.net/contact-us/">Support</a>
          </BurgerMenu>
        </div>
      </div>
    );
  }
}

export default connect(BurgerMenuContainer, {
  listenTo() {
    return [AccountStore, WalletUnlockStore, WalletManagerStore, SettingsStore];
  },
  getProps() {
    const chainID = Apis.instance().chain_id;
    return {
      linkedAccounts: AccountStore.getState().linkedAccounts,
      currentAccount: AccountStore.getState().currentAccount || AccountStore.getState().passwordAccount,
      locked: WalletUnlockStore.getState().locked,
      current_wallet: WalletManagerStore.getState().current_wallet,
      lastMarket: SettingsStore.getState().viewSettings.get(`lastMarket${chainID ? ("_" + chainID.substr(0, 8)) : ""}`),
      starredAccounts: SettingsStore.getState().starredAccounts,
      passwordLogin: SettingsStore.getState().settings.get("passwordLogin"),
      currentLocale: SettingsStore.getState().settings.get("locale"),
      locales: SettingsStore.getState().defaults.locale,
      traderMode: SettingsStore.getState().settings.get("traderMode"),
    };
  }
});
