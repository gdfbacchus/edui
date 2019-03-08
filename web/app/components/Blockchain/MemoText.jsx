import React from "react";
import PrivateKeyStore from "stores/PrivateKeyStore";
import WalletUnlockActions from "actions/WalletUnlockActions";
import counterpart from "counterpart";
import Icon from "../Icon/Icon";
import { connect } from "alt-react";
import WalletUnlockStore from "stores/WalletUnlockStore";
import utils from "common/utils";
import ReactTooltip from "react-tooltip";

class MemoText extends React.Component {

    static defaultProps = {
        fullLength: false
    };

    shouldComponentUpdate(nextProps) {
        return (
            !utils.are_equal_shallow(nextProps.memo, this.props.memo) ||
            nextProps.wallet_locked !== this.props.wallet_locked
        );
    }

    _toggleLock(e) {
        e.preventDefault();
        WalletUnlockActions.unlock().then(() => {
            console.log("unlocked");
            ReactTooltip.rebuild();
        });
    }

    render() {
        let {memo, fullLength} = this.props;
        if (!memo) {
            return null;
        }

        let {text, isMine} = PrivateKeyStore.decodeMemo(memo);
        let parsedMessage = null;
        //console.log("MemoText before parsing memo: ",text);
        if(text) {
            try {
              parsedMessage = JSON.parse(text);
              text = parsedMessage.memo_text_msg;
              if(typeof text !== "string")return null;
            } catch (err) {
                if(text.indexOf("{")!==0){
                    //console.log("This is simple text");
                } else {
                  //console.log("The memo is not proper format.");
                  text = "";
                }
            }

            //console.log("parsed memo text: ", text);
        }

        if ( !text && isMine) {
            return (
                <div className="memo">
                    <span>{counterpart.translate("transfer.memo_unlock")} </span>
                    <a href onClick={this._toggleLock.bind(this)}>
                        <Icon name="locked"/>
                    </a>
                </div>
            );
        }

        let full_memo = text;
        if (text && !fullLength && text.length > 35) {
            text = text.substr(0, 35) + "...";
        }

        if (text) {
            return (
                <div className="memo" style={{paddingTop: 5, cursor: "help"}}>
                    <span className="inline-block" data-class="memo-tip" data-tip={full_memo !== text ? full_memo : null} data-place="bottom" data-offset="{'bottom': 10}" data-html>
                        {text}
                    </span>
                </div>
            );
        } else {
            return null;
        }
    }
}

class MemoTextStoreWrapper extends React.Component {
    render () {
        return <MemoText {...this.props}/>;
    }
}

export default connect(MemoTextStoreWrapper, {
    listenTo() {
        return [WalletUnlockStore];
    },
    getProps() {
        return {
            wallet_locked: WalletUnlockStore.getState().locked
        };
    }
});
