import React, {Component} from "react";
import AltContainer from "alt-container";
import Translate from "react-translate-component";
import BindToChainState from "../Utility/BindToChainState";
import ChainTypes from "../Utility/ChainTypes";
import CachedPropertyStore from "stores/CachedPropertyStore";
import BlockchainStore from "stores/BlockchainStore";
import {ChainStore} from "bitsharesjs/es";
import WalletDb from "stores/WalletDb";
import TimeAgo from "../Utility/TimeAgo";
import Icon from "../Icon/Icon";
import ZfApi from "react-foundation-apps/src/utils/foundation-api";
import Chat from "../Chat/ChatWrapper";

import Popups from "../Modal/Popups";

class Footer extends React.Component {

    static propTypes = {
        dynGlobalObject: ChainTypes.ChainObject.isRequired,
        synced: React.PropTypes.bool.isRequired
    };

    static defaultProps = {
        dynGlobalObject: "2.1.0"
    };

    static contextTypes = {
        router: React.PropTypes.object
    };

    shouldComponentUpdate(nextProps) {
        return (
            nextProps.dynGlobalObject !== this.props.dynGlobalObject ||
            nextProps.backup_recommended !== this.props.backup_recommended ||
            nextProps.rpc_connection_status !== this.props.rpc_connection_status ||
            nextProps.synced !== this.props.synced
       );
    }

    show(modal_id) {
        this.setState({ open: true }, () => {
            ZfApi.publish(modal_id, "open");
        });
    }

    render() {

        let {disableChat, showChat, dockedChat, theme} = this.props;

        let block_height = this.props.dynGlobalObject.get("head_block_number");
        let block_time = this.props.dynGlobalObject.get("time") + "+00:00";
        // console.log("block_time", block_time)
        let bt = (new Date(block_time).getTime() + ChainStore.getEstimatedChainTimeOffset()) / 1000;
        let now = new Date().getTime() / 1000;
        let version_match = APP_VERSION.match(/2\.0\.(\d\w+)/);
        let version = version_match ? `.${version_match[1]}` : ` ${APP_VERSION}`;
        return (
            <div className="show-for-medium grid-block shrink footer">
                <Translate component="div" content="popups.sign_up" className="align-justify grid-block pointer" onClick={()=>{this.show("subscribe")}}  />                
                <Translate component="div" content="popups.add_coin" className="align-justify grid-block pointer" onClick={()=>{this.show("addcoin")}}  /> 
                {this.props.rpc_connection_status === "closed" ? <Translate className="align-justify grid-block txtlabel error" component="div" content="footer.connected" /> : null}
                {this.props.synced ? null : <Translate className="align-justify grid-block txtlabel error" component="div" content="footer.nosync" />}
                <div className="align-justify grid-block">
                    {this.props.backup_recommended ? <span>
                        <div className="grid-block">
                            <a className="shrink facolor-alert"
                                data-tip="Please understand that you are responsible for making your own backup&hellip;"
                                data-type="warning"
                                onClick={this.onBackup.bind(this)}><Translate content="footer.backup" /></a>
                            &nbsp;&nbsp;
                        </div>
                    </span> : null}
                </div>                
                <div className="align-justify grid-block">  
                {block_height ?
                    (<div className="grid-block shrink">
                        <Translate content="footer.block" /> &nbsp;
                        <span className="footer_number" >#{block_height} </span> &nbsp;
                        { now - bt > 5 ? <TimeAgo ref="footer_head_timeago" time={block_time} /> : <span data-tip="Synchronized" data-place="left"><Icon name="checkmark-circle" /></span> }
                    </div>) :
                    <div className="grid-block shrink"><Translate content="footer.loading" /></div>
                }
                </div>
                <Popups />
            </div>
        );
    }

    onBackup() {
        this.context.router.push("/wallet/backup/create");
    }

    onBackupBrainkey() {
        this.context.router.push("/wallet/backup/brainkey");
    }
}
Footer = BindToChainState(Footer, {keep_updating: true});

class AltFooter extends Component {

    render() {
        var wallet = WalletDb.getWallet();
        return <AltContainer
            stores={[CachedPropertyStore, BlockchainStore, WalletDb]}
            inject ={{
                backup_recommended: ()=>
                    (wallet && ( ! wallet.backup_date || CachedPropertyStore.get("backup_recommended"))),
                rpc_connection_status: ()=> BlockchainStore.getState().rpc_connection_status
                // Disable notice for separate brainkey backup for now to keep things simple.  The binary wallet backup includes the brainkey...
                // backup_brainkey_recommended: ()=> {
                //     var wallet = WalletDb.getWallet()
                //     if( ! wallet ) return undefined
                //     return wallet.brainkey_sequence !== 0 && wallet.brainkey_backup_date == null
                // }
            }}
            ><Footer {...this.props}/>
        </AltContainer>;
    }
}

export default AltFooter;
