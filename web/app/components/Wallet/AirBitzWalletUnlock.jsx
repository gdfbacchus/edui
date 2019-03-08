import React from "react";
import {browserHistory} from "react-router/es";
import Trigger from "react-foundation-apps/src/trigger";
import ZfApi from "react-foundation-apps/src/utils/foundation-api";
import PasswordInput from "../Forms/PasswordInput";
import notify from "actions/NotificationActions";
import Translate from "react-translate-component";
import counterpart from "counterpart";
import AltContainer from "alt-container";
import WalletDb from "stores/WalletDb";
import WalletUnlockStore from "stores/WalletUnlockStore";
import AccountStore from "stores/AccountStore";
import WalletUnlockActions from "actions/WalletUnlockActions";
import AccountActions from "actions/AccountActions";
import SettingsActions from "actions/SettingsActions";
import {Apis} from "bitsharesjs-ws";
import { FetchChain } from "bitsharesjs/es";
import utils from "common/utils";
import AccountSelector from "../Account/AccountSelector";
import WalletActions from "actions/WalletActions";
import {makeABCUIContext} from "airbitz-core-js-ui/lib/abcui.es6";
import { airbitzAPIs } from "api/apiConfig";
import SettingsStore from "stores/SettingsStore";
//import abcui from "airbitz-core-js-ui";
let _abcUi = makeABCUIContext(airbitzAPIs);




class WalletUnlockModal extends React.Component {

    static contextTypes = {
        router: React.PropTypes.object
    }

    constructor(props) {
        super();
        this.state = this._getInitialState(props);
        this.onPasswordEnter = this.onPasswordEnter.bind(this);
        this.restore_brain_airbitz = this.restore_brain_airbitz.bind(this);
    }

    _getInitialState(props = this.props) {
        return {
            password_error: null,
            airbitz_mode: true,
            password_input_reset: Date.now(),
            account_name: props.passwordAccount,
            account: null
        };
    }

    reset() {
        this.setState(this._getInitialState());
    }

    componentWillReceiveProps(np) {

        let airbitzkey = document.querySelector(".airbitzkey");

        if (np.passwordAccount && !this.state.account_name) {
            this.setState({
                account_name: np.passwordAccount
            });
        }


        if(airbitzkey&&airbitzkey.getAttribute("show_switch_airbitzkey")=="false"){
            let show_switch_airbitzkey = JSON.parse(airbitzkey.getAttribute("show_switch_airbitzkey"));
            this.setState({
                airbitz_mode: show_switch_airbitzkey
            });
        }

    }

    shouldComponentUpdate(np, ns) {

        return (
            !utils.are_equal_shallow(np, this.props) ||
            !utils.are_equal_shallow(ns, this.state)
        );
    }

    componentDidMount() {
        ZfApi.subscribe(this.props.modalId, (name, msg) => {
            if(name !== this.props.modalId)
                return;
            if(msg === "close") {
                //if(this.props.reject) this.props.reject()
                WalletUnlockActions.cancel();
            } else if (msg === "open") {
                if (!this.props.passwordLogin) {
                    if (this.refs.password_input) {
                        this.refs.password_input.clear();
                        this.refs.password_input.focus();
                    }
                    if(WalletDb.getWallet() && Apis.instance().chain_id !== WalletDb.getWallet().chain_id) {
                        notify.error("This wallet was intended for a different block-chain; expecting " +
                            WalletDb.getWallet().chain_id.substring(0,4).toUpperCase() + ", but got " +
                            Apis.instance().chain_id.substring(0,4).toUpperCase());
                        ZfApi.publish(this.props.modalId, "close");
                        return;
                    }
                }
            }
        });

        if (this.props.passwordLogin) {
            if (this.state.account_name) {
                this.refs.password_input.focus();
            } else if (this.refs.account_input && this.refs.account_input.refs.bound_component) {
                this.refs.account_input.refs.bound_component.refs.user_input.focus();
            }
        }
    }

    componentDidUpdate() {
        //DEBUG console.log('... componentDidUpdate this.props.resolve', this.props.resolve)
        if(this.props.resolve) {
            if (WalletDb.isLocked()){
                ZfApi.publish(this.props.modalId, "open");
                /*setTimeout(()=>{
                 this.props.resolve();
                 ZfApi.publish(this.props.modalId, "close");
                 },1000)*/
            }else{
                //this.props.resolve()
            }
        }
    }

    onPasswordEnter(e) {
        e&&e.preventDefault();
        const {passwordLogin} = this.props;
        const password = passwordLogin ? this.refs.password_input.value : this.refs.password_input.value();
        const account = passwordLogin ? this.state.account && this.state.account.get("name") : null;
        this.setState({password_error: null});

        WalletDb.validatePassword(
            password,
            true, //unlock
            account
        );
        setTimeout(()=>{

            let account_is_valid = WalletDb.validatePassword(
                password,
                true, //unlock
                account
            );

            if (!account_is_valid) {
                this.setState({password_error: true});
                return false;
            } else {
                if (!passwordLogin) {
                    this.refs.password_input.clear();
                } else {
                    this.refs.password_input.value = "";
                    AccountActions.setPasswordAccount(account); //@>
                    let airbitzkey = document.querySelector(".airbitzkey");
                    if(airbitzkey){
                        airbitzkey.setAttribute("acc",account);
                        airbitzkey.setAttribute("p",password);
                        setTimeout(()=>{
                            airbitzkey.setAttribute("p","");
                        },90000);
                    }

                }

                setTimeout(()=>{
                    ZfApi.publish(this.props.modalId, "close");
                },500)

                this.props.resolve();
                WalletUnlockActions.change();
                this.setState({password_input_reset: Date.now(), password_error: false});

                if(!AccountStore.getState().currentAccount){
                    browserHistory.push('/dashboard');
                    if (window.electron) {
                        window.location.hash = "";
                        window.remote.getCurrentWindow().reload();
                    }
                }
            }
        },300)
        return false;
    }

    restore_brain_airbitz(e){
        e&&e.preventDefault();

        let { airbitz_mode } = this.state;

        let airbitz_password_input_1 = this.refs.airbitz_password_input_1.value;
        let airbitz_password_input_2 = this.refs.airbitz_password_input_2.value;

        if(!airbitz_password_input_1||!airbitz_password_input_2){
            this.setState({password_error: true});
        }else if(airbitz_password_input_1!==airbitz_password_input_2){
            this.setState({password_error: true});
        }else if(airbitz_password_input_1==airbitz_password_input_2){
            this.setState({password_error: false},()=>{

                _abcUi.openLoginWindow((error, account) =>{

                    if (error) {
                        console.log(error)
                    }

                    let air_ids = account.listWalletIds();
                    if(air_ids.length){
                        let last_air_key = air_ids[air_ids.length-1];
                        let acc_keys = account.getWallet(last_air_key);
                        console.log('@>acc_keys',acc_keys)

                        if(acc_keys&&acc_keys.keys&&acc_keys.keys.model==="wallet"&&acc_keys.keys.key){
                            WalletActions.setWallet("default_wallet_airbitz", airbitz_password_input_1, acc_keys.keys.key).then((ans)=>{

                                if(WalletDb.getWallet()){
                                    // this.props.resolve();
                                    ZfApi.publish(this.props.modalId, "close");
                                    this.context.router.push("/dashboard");

                                    setTimeout(()=>{
                                        if(!AccountStore.getMyAccounts().length){
                                            notify.addNotification({
                                                message: `Incorrect Brain key`,
                                                level: "error",
                                                autoDismiss: 10
                                            });
                                        }else{
                                            SettingsActions.changeSetting({
                                                setting: "passwordLogin",
                                                value: false
                                            });
                                            notify.addNotification({
                                                message: `You are logined`,
                                                level: "info",
                                                autoDismiss: 10
                                            });
                                        }
                                        browserHistory.push('/dashboard');
                                    },1500);
                                }
                            }).catch((err)=>{console.error('@>err',err)});

                            this.refs.airbitz_password_input_1.value="";
                            this.refs.airbitz_password_input_2.value="";
                            this.setState({
                                airbitz_mode:false
                            });
                        }else if(acc_keys&&acc_keys.keys&&acc_keys.keys.model==="account"&&acc_keys.keys.key&&acc_keys.keys.login){

                            FetchChain("getAccount", acc_keys.keys.login).then((ans)=>{

                                WalletDb.validatePassword(
                                    acc_keys.keys.key,
                                    true, //unlock
                                    acc_keys.keys.login
                                );

                                console.log('@>acc_keys.keys.key',acc_keys.keys.key)
                                console.log('@>acc_keys.keys.login',acc_keys.keys.login)
                                setTimeout(()=>{

                                    let account_is_valid =  WalletDb.validatePassword(
                                        acc_keys.keys.key || "",
                                        true, //unlock
                                        acc_keys.keys.login
                                    );

                                    if (!account_is_valid) {
                                        this.setState({password_error: true});
                                        return false;
                                    } else {
                                        AccountActions.setPasswordAccount(acc_keys.keys.login);
                                        ZfApi.publish(this.props.modalId, "close");
                                        this.props.resolve();
                                        WalletUnlockActions.change();
                                        this.setState({password_input_reset: Date.now(), password_error: false});

                                        SettingsActions.changeSetting({
                                            setting: "passwordLogin",
                                            value: true
                                        });
                                    }

                                },300)


                            }).catch((err)=>{
                                console.log('@>err',err)
                            });
                        }
                    }
                });
            });
        }
    }

    _switch_brain_airbitz(mode){
        localStorage.setItem("airbitz_backup_option", !!mode + "");
        this.setState({
            airbitz_mode:!!mode
        });
    }

    _toggleLoginType(mode) {
        SettingsActions.changeSetting({
            setting: "passwordLogin",
            value: !!mode
        });
    }

    reg_continue() {
        ZfApi.publish(this.props.modalId, "close");
        //ZfApi.publish("residents_confirm", "open");
        this.context.router.push(`/create-account/${window._type_registration_wallet||"wallet"}`);

    }

    renderWalletLogin() {
        if (!WalletDb.getWallet()) {
            return (
                <div>
                    <Translate content="wallet.no_wallet" component="p" />
                    <div className="button-group">
                        <div className="button" onClick={this.reg_continue.bind(this)}><Translate content="wallet.create_wallet" /></div>
                    </div>
                    <Translate onClick={()=>{ this._switch_brain_airbitz(false); this._toggleLoginType(true);}} component="div" content="wallet.switch_model_password" className="button small outline float-right airbitz_button" />
                    <Translate onClick={()=>{ this._switch_brain_airbitz(true); this._toggleLoginType(true);}} component="div" content="wallet.enable_model_airbitz" className="button small outline float-right" />

                </div>
            );
        }

        return (
            <form onSubmit={this.onPasswordEnter} noValidate>
                <PasswordInput
                    ref="password_input"
                    onEnter={this.onPasswordEnter}
                    key={this.state.password_input_reset}
                    wrongPassword={this.state.password_error}
                    noValidation
                />

                <div>
                    <div className="button-group">
                        <button className="button" data-place="bottom" data-html data-tip={counterpart.translate("tooltip.login")} onClick={this.onPasswordEnter}><Translate content="header.unlock" /></button>
                        <Trigger close={this.props.modalId}>
                            <div className=" button"><Translate content="account.perm.cancel" /></div>
                        </Trigger>
                    </div>
                    <div onClick={()=>{ this._toggleLoginType(true)}} className="button small outline float-right"><Translate content="wallet.switch_model_password" /></div>
                </div>
            </form>
        );
    }

    accountChanged(account_name) {
        if (!account_name) this.setState({account: null});
        this.setState({account_name, error: null});
    }

    onAccountChanged(account) {
        this.setState({account, error: null});
    }

    renderPasswordLogin() {
        let {account_name, from_error, airbitz_mode} = this.state;
        let tabIndex = 1;

        return (
            <form onSubmit={this.onPasswordEnter} noValidate style={{paddingTop: 20}}>
                <input type="text" className="no-padding no-margin" style={{visibility: "hidden", height: 0}}/>

                <div className="content-block">
                    {
                        (()=>{
                            return (
                                <div className="content-block">
                                    <div className="account-selector">
                                        <div className="content-area">
                                            <div className="header-area">
                                                <Translate className="left-label" component="label" content="settings.password_airbitz_1" />
                                            </div>
                                            <div className="input-area">
                                                <div className="inline-label input-wrapper">
                                                    <div className="account-image">
                                                        <img src="/app/assets/airbitz.png" alt="" style={{height:"2.4rem",width:"2.4rem"}} />
                                                    </div>
                                                    <input ref="airbitz_password_input_1" type="password" tabIndex={tabIndex++} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })()
                    }
                </div>

                <div className="content-block">
                    <div className="account-selector">
                        <div className="content-area">
                            <div className="header-area">
                                <Translate className="left-label" component="label" content={"settings."+("password_airbitz_2")} />
                            </div>
                            <div className="input-area" style={{marginLeft: "3.5rem"}}>
                                <input ref={airbitz_mode?"airbitz_password_input_2":"password_input"} type="password" tabIndex={tabIndex++} />
                            </div>
                            {this.state.password_error ? <div className="error-area">
                                <Translate content="wallet.pass_incorrect" />
                            </div> : null}
                        </div>
                    </div>
                </div>


                <div style={{marginLeft: "3.5rem"}}>
                    <div className="button-group">
                        <Translate component="button" className="button" onClick={this.restore_brain_airbitz} content="header.unlock_short" tabIndex={tabIndex++} />
                        <Trigger close={this.props.modalId}>
                            <div tabIndex={tabIndex++} className=" button"><Translate content="account.perm.cancel" /></div>
                        </Trigger>
                    </div>
                </div>
            </form>
        );
    }

    render() {
        const {passwordLogin} = this.props;
        console.log('@>passwordLogin',passwordLogin)
        // DEBUG console.log('... U N L O C K',this.props)

        // Modal overlayClose must be false pending a fix that allows us to detect
        // this event and clear the password (via this.refs.password_input.clear())
        // https://github.com/akiran/react-foundation-apps/issues/34
        return (
            // U N L O C K
            <div>
                <Translate component="h3" content="header.unlock_airbitz" />
                {/*{passwordLogin ? this.renderPasswordLogin() : this.renderWalletLogin()}*/}
                {this.renderPasswordLogin()}
            </div>
        );
    }

}

WalletUnlockModal.defaultProps = {
    modalId: "unlock_wallet_modal2"
};

class WalletUnlockModalContainer extends React.Component {
    constructor (props) {
        super();
        this.props = props;
    }
    render() {
        return (
            <AltContainer
                stores={[WalletUnlockStore, AccountStore, SettingsStore]}
                inject={{
                    resolve: () => {
                        return WalletUnlockStore.getState().resolve;
                    },
                    reject: () => {
                        return WalletUnlockStore.getState().reject;
                    },
                    locked: () => {
                        return WalletUnlockStore.getState().locked;
                    },
                    currentAccount: () => {
                        return AccountStore.getState().currentAccount;
                    },
                    passwordLogin: () => {
                        return true;//SettingsStore.getState().settings.get("passwordLogin");
                    },
                    passwordAccount: () => {
                        return AccountStore.getState().passwordAccount || "";
                    }
                }}
            >
                <WalletUnlockModal {...this.props} />
            </AltContainer>
        );
    }
}
export default WalletUnlockModalContainer;
