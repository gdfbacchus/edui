import React from "react";
import {connect} from "alt-react";
import autoBind from 'react-autobind';
import classNames from "classnames";
import AccountActions from "actions/AccountActions";
import AccountStore from "stores/AccountStore";
import notify from "actions/NotificationActions";
import LoadingIndicator from "../LoadingIndicator";
import Translate from "react-translate-component";
import utils from 'common/utils';
import utils2 from '../../utils/formValidations';

class UserAnswerValidation extends React.Component {
  constructor() {
    super();
    autoBind(this);

    this.state = {
      receivedToken: '',
      validAccountName: false,
      answer: "",
      isValidAnswer: false,
      step: 1,
      loading: false,
      isVerifiedToken: false,
      received_user_question: "",
      decryptedPassword: ""
    };
  }

  componentWillMount() {
    const token = this.props.params.token;
    this.submitToken(token);
  }

  componentWillUnmount() {
    this.setState({
      receivedToken: '',
      validAccountName: false,
      answer: "",
      isValidAnswer: false,
      step: 1,
      loading: false,
      isVerifiedToken: false,
      received_user_question: "",
      decryptedPassword: ""
    });
  }

  submitToken(token) {
    this.setState({loading: true});
    const data = {
      token
    };

    AccountActions.recoveryTokenVerification(data).then((response) => {
      this.setState({
        step: 2,
        loading: false,
        isVerifiedToken: true,
        received_user_question: response.user_question,
        receivedToken: data.token
      });
    }).catch(error => {
      console.log("error: ",error);
      notify.addNotification({
        message: `Failed to load this page: ${error}`,
        level: "error",
        autoDismiss: 10
      });
      this.setState({loading: false});
    });
  }

  componentDidMount() {
    //ReactTooltip.rebuild();
  }

  shouldComponentUpdate(nextProps, nextState) {
    return !utils.are_equal_shallow(nextState, this.state);
  }

  _onChangeAnswer(event) {
    let value = event.target.value;
    const isValid = utils2.isValidAnswer(value);
    this.setState({answer: value, isValidAnswer: isValid});
  }

  submitAnswer() {
    this.setState({loading: true});

    const data = {
      answer: this.state.answer,
      token: this.state.receivedToken
    };

    AccountActions.recoveryPasswordAnswerVerification(data).then((response) => {
      //console.log("recoveryPasswordAnswerVerification response: ",response);
      if(response.decryptedPass) {
        this.setState({
          step: 3,
          loading: false,
          isVerifiedAnswer: true,
          decryptedPassword: response.decryptedPass
        });
      } else {
        notify.addNotification({
          message: `Failed to verify answer: your password not found`,
          level: "error",
          autoDismiss: 10
        });
        this.setState({loading: false});
      }
    }).catch(error => {
      console.log("error: ",error);
      notify.addNotification({
        message: `Failed to verify answer: ${error}. Please check your answer.`,
        level: "error",
        autoDismiss: 12
      });
      this.setState({loading: false});
    });
  }

  _renderContent() {
    let{isVerifiedToken} = this.state;

    return(
      isVerifiedToken && this.state.step===2 ? this._renderAnswerForm() :
        isVerifiedToken && this.state.step===3 ? this._renderEncryptedPassword() : null
    );
  }

  _renderAnswerForm() {
    let isValidForm = this.state.isValidAnswer;
    let buttonClass = classNames("submit-button button no-margin", {disabled: (!isValidForm)});

    return(
        <div>
          <div className="sub-content small-12" style={{paddingTop: 0}}>
            <div><Translate content="account.answer_verification.page1_text_1" component="h5"/>
            </div>
            <div className="sub-content small-12" style={{paddingTop: 0}}>
              <div className="store-pass" style={{textAlign: 'center'}}>
                <div className="divider"/>

                <div>
                  <section>
                    <label className="left-label"><Translate content="account.answer_verification.answer" /></label>
                    <input
                      name="value"
                      type="text"
                      autoComplete="off"
                      placeholder={'Your answer'}
                      onChange={this._onChangeAnswer}
                      onBlur={this._onChangeAnswer}
                    />
                  </section>
                  {!isValidForm ?
                    <div className="has-error">
                      <Translate content="account.answer_verification.token_error"/>
                    </div> : null}
                </div>

                <div className="divider"/>
                {this.state.loading ? <LoadingIndicator type="three-bounce"/> :
                  <button onClick={this.submitAnswer}  className={buttonClass}><Translate content="account.answer_verification.submit"/></button>}
              </div>
            </div>
          </div>
        </div>
    );
  }

  _renderEncryptedPassword() {
    return (
      <div>
        <div className="sub-content small-12" style={{paddingTop: 0, textAlign: 'center'}}>
          <div>
            <Translate content="account.answer_verification.page2_text_1" component="h5"/>
            <h6 style={{color: '#5c9be5', fontSize: '1.3rem', fontWeight: '700'}}>{this.state.decryptedPassword}</h6>
          </div>
        </div>
      </div>
    );
  }

  render() {

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

            {this._renderContent()}

          </div>
        </div>
      </div>
    );
  }
}

export default connect(UserAnswerValidation, {
  listenTo() {
    return [AccountStore];
  },
  getProps() {
    return {};
  }
});