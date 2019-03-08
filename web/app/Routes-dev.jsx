import React from "react";

import { Router, Route, IndexRoute, browserHistory, hashHistory } from "react-router/es";
import willTransitionTo2 from "./routerTransition";
import App from "./App";

// Components imported here for react hot loader (does not work with async route loading)
import DashboardContainer from "./components/Dashboard/DashboardContainer";
import Witnesses from "./components/Explorer/Witnesses";
import CommitteeMembers from "./components/Explorer/CommitteeMembers";
import FeesContainer from "./components/Blockchain/FeesContainer";
import BlocksContainer from "./components/Explorer/BlocksContainer";
import AssetsContainer from "./components/Explorer/AssetsContainer";
import AccountsContainer from "./components/Explorer/AccountsContainer";
import Explorer from "components/Explorer/Explorer";
import AccountPage from "./components/Account/AccountPage";
import AccountOverview from "./components/Account/AccountOverview";
import AccountAssets from "./components/Account/AccountAssets";
import {AccountAssetCreate} from "./components/Account/AccountAssetCreate";
import AccountAssetUpdate from "./components/Account/AccountAssetUpdate";
import AccountSignedMessages from "./components/Account/AccountSignedMessages";
import AccountMembership from "./components/Account/AccountMembership";
import AccountVesting from "./components/Account/AccountVesting";
import AccountDepositWithdraw from "./components/Account/AccountDepositWithdraw";
import AccountDepositWithdraw_OL from "./components/Account/AccountDepositWithdraw_OL";
import AccountPermissions from "./components/Account/AccountPermissions";
import AccountWhitelist from "./components/Account/AccountWhitelist";
import AccountVoting from "./components/Account/AccountVoting";
import AccountOrders from "./components/Account/AccountOrders";
import ExchangeContainer from "./components/Exchange/ExchangeContainer";
import MarketsContainer from "./components/Exchange/MarketsContainer";
import Transfer from "./components/Transfer/Transfer";
import MultipleTransfers from "./components/Transfer/MultipleTransfers";

import SettingsContainer from "./components/Settings/SettingsContainer";
import BlockContainer from "./components/Blockchain/BlockContainer";
import AssetContainer from "./components/Blockchain/AssetContainer";
import CreateAccount from "./components/Account/CreateAccount";
import CreateAccountPassword from "./components/Account/CreateAccountPassword";
import {ExistingAccount, ExistingAccountOptions} from "./components/Wallet/ExistingAccount";
import { WalletCreate , CreateWalletFromBrainkey } from "./components/Wallet/WalletCreate";
import ImportKeys from "./components/Wallet/ImportKeys";
import Invoice from "./components/Transfer/Invoice";
import {BackupCreate, BackupRestore} from "./components/Wallet/Backup";
import WalletChangePassword from "./components/Wallet/WalletChangePassword";
import {WalletManager, WalletOptions, ChangeActiveWallet, WalletDelete} from "./components/Wallet/WalletManager";
import BalanceClaimActive from "./components/Wallet/BalanceClaimActive";
import BackupBrainkey from "./components/Wallet/BackupBrainkey";
import Login from "./components/Login/Login";
import Brainkey from "./components/Wallet/Brainkey";
import Help from "./components/Help";
import InitError from "./components/InitError";
import Residents_unsupported from "./components/Residents_unsupported";

import MyOrders from "./components/Account/MyOrders";
import LoginSelector from "./components/LoginSelector";
import CreateWorker from "./components/Account/CreateWorker";

import ForgotPassword from "./components/Login/ForgotPassword";
import UserAnswerValidation from "./components/Login/UserAnswerValidation";

import Welcome from "./components/Welcome/Welcome";
import StoreEncryptedPasswordCopy from './components/Account/StoreEncryptedPasswordCopy';
const history = __HASH_HISTORY__ ? hashHistory : browserHistory;

class Auth extends React.Component {
    render() {return null; }
}

const routes = (
    <Route path="/" component={App} onEnter={willTransitionTo2}>
        <IndexRoute component={DashboardContainer}/>
        <Route path="/auth/:data" component={Auth}/>
        <Route path="/dashboard" component={DashboardContainer}/>
        <Route path="/welcome" component={Welcome}/>
        <Route path="explorer" component={Explorer}/>

        <Route path="/explorer/fees" component={FeesContainer} />
        <Route path="/explorer/blocks" component={BlocksContainer} />
        <Route path="/explorer/assets" component={AssetsContainer} />
        <Route path="/explorer/accounts" component={AccountsContainer} />
        <Route path="/explorer/witnesses" component={Witnesses} />
        <Route path="/explorer/committee-members" component={CommitteeMembers} />

        <Route path="wallet" component={WalletManager} >
            {/* wallet management console */}
            <IndexRoute component={WalletOptions} />
            <Route path="change" component={ChangeActiveWallet} />
            <Route path="change-password" component={WalletChangePassword} />
            <Route path="import-keys" component={ImportKeys} />
            <Route path="brainkey" component={ExistingAccountOptions} />
            <Route path="create" component={WalletCreate} />
            <Route path="delete" component={WalletDelete} />
            <Route path="backup/restore" component={BackupRestore} />
            <Route path="backup/create" component={BackupCreate} />
            <Route path="backup/brainkey" component={BackupBrainkey} />
            <Route path="balance-claims" component={BalanceClaimActive} />
        </Route>

        <Route path="create-wallet" component={WalletCreate} />
        <Route path="create-wallet-brainkey" component={CreateWalletFromBrainkey} />

        <Route path="transfer" component={Transfer}/>
        {/*<Route path="multiple-transfers" component={MultipleTransfers}/>*/}

        <Route path="invoice/:data" component={Invoice} />
        <Route path="explorer/markets" component={MarketsContainer} />
        <Route path="market/:marketID" component={ExchangeContainer} />
        <Route path="settings" component={SettingsContainer} />
        <Route path="block/:height" component={BlockContainer} />
        <Route path="asset/:symbol" component={AssetContainer} />
        <Route path="create-account" component={LoginSelector}>
            <Route path="wallet" component={CreateAccount} />
            <Route path="password" component={CreateAccountPassword} />
        </Route>

        <Route path="login" component={Login} />
        <Route path="forgot-password" component={ForgotPassword} />
        <Route path="forgot-password/:token" component={UserAnswerValidation} />

        <Route path="existing-account" component={ExistingAccount} >
            <IndexRoute component={BackupRestore} />
            <Route path="import-backup" component={ExistingAccountOptions} />
            <Route path="import-keys" component={ImportKeys} />
            <Route path="brainkey" component={Brainkey} />
            <Route path="balance-claim" component={BalanceClaimActive} />
        </Route>

        <Route path="my-orders" component={MyOrders}/>

        <Route path="/account/:account_name" component={AccountPage} >
            <IndexRoute component={AccountOverview} />
            <Route path="overview" component={AccountOverview} />
            <Route path="assets" component={AccountAssets} />
            <Route path="create-asset" component={AccountAssetCreate} />
            <Route path="update-asset/:asset" component={AccountAssetUpdate} />
            <Route path="member-stats" component={AccountMembership} />
            <Route path="vesting" component={AccountVesting} />
            <Route path="permissions" component={AccountPermissions} />
            <Route path="voting" component={AccountVoting} />
            <Route path="deposit-withdraw" component={AccountDepositWithdraw} />
            <Route path="deposit-withdraw-ol" component={AccountDepositWithdraw_OL} />
            <Route path="orders" component={AccountOrders} />
            <Route path="whitelist" component={AccountWhitelist} />
            <Route path="signedmessages" component={AccountSignedMessages} />
        </Route>

        <Route path="deposit-withdraw" component={AccountDepositWithdraw} />
        <Route path="deposit-withdraw-ol" component={AccountDepositWithdraw_OL} />
        <Route path="create-worker" component={CreateWorker} />
        <Route path="/init-error" component={InitError} />
        <Route path="/residents-unsupported" component={Residents_unsupported} />
        <Route path="/help" component={Help} >
            <Route path=":path1" component={Help} >
                <Route path=":path2" component={Help} >
                    <Route path=":path3" component={Help} />
                </Route>
            </Route>
        </Route>
    </Route>
);

export default class Routes extends React.Component {
    render() {
        return <Router history={history} routes={routes} />;
    }
}
