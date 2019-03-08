import React from "react";
import autoBind from 'react-autobind';
import Translate from "react-translate-component";
import classNames from "classnames";
import utils2 from '../../utils/formValidations';
import LoadingIndicator from "../LoadingIndicator";
import createAccountConstants from 'assets/constants/create_account_constants'

export default class StoreEncryptedPasswordCopy extends React.Component {
  static propTypes = {
    // submitForm: React.PropTypes.func.Required,
    // loading: React.PropTypes.bool.Required
  };

  constructor(props) {
    super(props);
    autoBind(this);
    this.state = {
      understand_1: false,
      epEmail: "",
      epQuestion: "",
      epAnswer: "",
      epEncryptedPass: "",
      isValidEpEmail: true,
      isValidEpAnswer: false,
      isValidEpQuestion: false,
      questions: createAccountConstants.questions
    };

  }

  onClickSave(e) {
    if(this._isValidEncPassForm) {
      const formData = {
        username: this.state.accountName ? this.state.accountName : 'testName',
        password: this.state.password ? this.state.password : 'test123',
        email: this.state.epEmail,
        question: this.state.epQuestion === "" ? this.state.questions[0] : this.state.epQuestion,
        answer: this.state.epAnswer
      };
      this.props.submitForm(e, formData);
    }
  }

  _isValidEncPassForm() {
    return this.state.isValidEpEmail && this.state.isValidEpAnswer && this.state.isValidEpQuestion;
  }

  _checkEncPassEmail(){
    const email = this.state.epEmail;
    const isValidEmail = utils2.isValidEmail(email);
    this.setState({isValidEpEmail: isValidEmail});
  }
  _onChangeEncPassEmail(event) {
    const value = event.target.value;
    const isValidEmail = utils2.isValidEmail(value);
    this.setState({epEmail: value, isValidEpEmail: isValidEmail});
  }

  _onChangeEncPassQuestion(event) {
    const questionValue = event.target.value;
    this.setState({epQuestion: questionValue});
    this._isValidQuestion(questionValue);
  }

  _isValidQuestion(questionValue) {
    if(questionValue === this.state.questions[0]){
      this.setState({isValidEpQuestion: false});
    }else{
      this.setState({isValidEpQuestion: true});
    }
  }

  _onChangeEncPassAnswer(event) {
    this._checkEncPassAnswer(event);
    this.setState({epAnswer: event.target.value});
  }

  _checkEncPassAnswer(event) {
    const isValid = utils2.isValidAnswer(event.target.value);
    this.setState({isValidEpAnswer: isValid});
  }

  render() {
    let isValidEncPassForm = this._isValidEncPassForm();
    let buttonClass = classNames("submit-button button no-margin", {disabled: (!isValidEncPassForm)});

    let key = 0;
    return (
      <div className="grid-block align-center">
        <div className="grid-block shrink ">
          <div className="grid-content shrink account-creation">
            <div className="sub-content small-12" style={{paddingTop: 0}}>
              <div className="sub-content small-12" style={{paddingTop: 0}}>
                <div className="store-pass" style={{textAlign: 'center'}}>

                  <Translate content="wallet.heading_1" component="h4" />
                  <p>Store an encrypted copy of my password</p>

                  <div className="divider"/>

                  <div>
                    <section>
                      <label className="left-label">Email</label>
                      <input
                        name="value"
                        type="text"
                        autoComplete="off"
                        placeholder={'Your email'}
                        onBlur={this._checkEncPassEmail}
                        onChange ={this._onChangeEncPassEmail}
                      />
                    </section>
                    {!this.state.isValidEpEmail ?
                      <div className="has-error">
                        <Translate content="wallet.email_error"/>
                      </div> : null}
                  </div>

                  <div className="divider"/>

                  <div>
                    <section>
                      <label className="left-label">Select Question</label>
                      <select
                        className="form-control bts-select"
                        onChange={ this._onChangeEncPassQuestion }
                      >
                        {this.state.questions
                          .sort()
                          .map((question) => {
                            if (!question || question === "") {return null; }
                            return <option key={key++} value={question}>{question}</option>;
                          })}
                      </select>
                    </section>
                    {!this.state.isValidEpQuestion ?
                      <div className="has-error">
                        <Translate content="wallet.question_error"/>
                      </div> : null}
                  </div>

                  <div className="divider"/>

                  <div>
                    <section>
                      <label className="left-label">Answer</label>
                      <input
                        name="value"
                        type="text"
                        autoComplete="off"
                        placeholder={'Your answer'}
                        onChange={this._onChangeEncPassAnswer}
                        onBlur={this._checkEncPassAnswer}
                      />
                    </section>
                    {!this.state.isValidEpAnswer ?
                      <div className="has-error">
                        <Translate content="wallet.answer_error"/>
                      </div> : null}
                  </div>

                  <div className="divider"/>
                  {this.props.loading ? <LoadingIndicator type="three-bounce"/> :
                    <button onClick={this.onClickSave}  className={buttonClass}><Translate content="wallet.save"/></button>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
}
