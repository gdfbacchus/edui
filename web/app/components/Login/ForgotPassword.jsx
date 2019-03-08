import React from "react";
import {connect} from "alt-react";
import autoBind from 'react-autobind';
import classNames from "classnames";
import AccountActions from "actions/AccountActions";
import AccountStore from "stores/AccountStore";
import notify from "actions/NotificationActions";
import LoadingIndicator from "../LoadingIndicator";
import Translate from "react-translate-component";
import ReactTooltip from "react-tooltip";
import utils from 'common/utils';
import utils2 from '../../utils/formValidations';

class ForgotPassword extends React.Component {
  constructor() {
    super();
    autoBind(this);
    this.state = {
      username: "",
      isValidAccountName: false,
      accountName: "",
      step: 1,
      loading: false
    };
  }

  componentWillMount() {

  }

  componentDidMount() {
    ReactTooltip.rebuild();
  }

  shouldComponentUpdate(nextProps, nextState) {
    return !utils.are_equal_shallow(nextState, this.state);
  }

  _onChangeUsername(event){
    let value = event.target.value;
    let isValid = utils2.isValidUsername(value);
    this.setState({username: value, isValidAccountName: isValid});
  }

  submitUsername(event){
    event.preventDefault();
    event.stopPropagation();
    this.setState({loading: true});

    const formData = {
      username: this.state.username
    };

    AccountActions.usernameVerification(formData).then((response) => {
      this.setState({
        step: 2,
        loading: false
      });
    }).catch(error => {
      console.log("error: ",error);
      let error_msg = error.base && error.base.length && error.base.length > 0 ? error.base[0] : "unknown error";
      if (error.remote_ip) error_msg = error.remote_ip[0];

      notify.addNotification({
        message: `Failed to verify username: ${name} - ${error_msg}`,
        level: "error",
        autoDismiss: 10
      });
      this.setState({loading: false});
    });
  }

  _renderRecoveryPasswordStep1 = () => {
    let isValidForm = this.state.isValidAccountName;
    let buttonClass = classNames("submit-button button no-margin", {disabled: (!isValidForm)});

    return (
      <div className="grid-block align-center">
        <div className="grid-block shrink ">
          <div className="grid-content shrink account-creation">
            <div className="sub-content small-12" style={{paddingTop: 0}}>
              <div className="sub-content small-12" style={{paddingTop: 0}}>
                <div className="store-pass" style={{textAlign: 'center'}}>

                  <Translate content="account.forgot_pass.text_1" component="h5" />
                  <div className="divider"/>

                  <div>
                    <section>
                      <label className="left-label"><Translate content="account.forgot_pass.username" /></label>
                      <input
                        name="value"
                        type="text"
                        autoComplete="off"
                        placeholder={'Your username'}
                        onChange={this._onChangeUsername}
                        onBlur={this._onChangeUsername}
                      />
                    </section>
                    {!isValidForm ?
                      <div className="has-error">
                        <Translate content="account.forgot_pass.username_error"/>
                      </div> : null}
                  </div>

                  <div className="divider"/>
                  {this.state.loading ? <LoadingIndicator type="three-bounce"/> :
                    <button onClick={this.submitUsername}  className={buttonClass}><Translate content="account.forgot_pass.submit_username"/></button>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  _renderCheckedUsernameResponseStep2 = () => {
    return (
      <div className="grid-block align-center">
        <div className="grid-block shrink ">
          <div className="grid-content shrink account-creation">
            <div className="sub-content small-12" style={{paddingTop: 0}}>
              <div className="sub-content small-12" style={{paddingTop: 0}}>
                <div className="store-pass" style={{textAlign: 'center'}}>
                  <Translate content="account.forgot_pass.text_2" component="h5" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  render() {
    let {step} = this.state;

    return (
      <div className="grid-block align-center">
        <div className="grid-block shrink ">
          <div className="grid-content shrink account-creation">

            <div className="grid-block shrink align-center">
              <div className="create_account_index text-center">
                <img src="/app/assets/EasyDex-logo-text-white-small.png" alt=""/>
                <Translate content="account.forgot_pass.heading_1" component="h3" style={{fontWeight: "bold", marginTop: 20}}/>
              </div>
            </div>

            <div className="sub-content small-12" style={{paddingTop: 0}}>
              {step===1 ? this._renderRecoveryPasswordStep1() : step===2 ? this._renderCheckedUsernameResponseStep2() : null}
            </div>

          </div>
        </div>
      </div>
    );
  }
}

export default connect(ForgotPassword, {
  listenTo() {
    return [AccountStore];
  },
  getProps() {
    return {};
  }
});