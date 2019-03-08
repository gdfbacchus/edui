import React from "react";
import {Link} from "react-router/es";
import Translate from "react-translate-component";

export default class Welcome extends React.Component {

  onSelect(route) {
    this.props.router.push("/create-account/" + route);
  }

  render() {
    return (
      <div className="grid-block align-center">
          <div className="grid-block shrink centeredContainer">
              <div className="grid-content shrink text-center account-creation welcome">
                  <div>
                      <img src="/app/assets/EasyDex-logo-text-white-small.png" alt="" />
                  </div>
                  <Translate content="account.welcome" component="h2"/>
                  <Translate unsafe content="account.centralized" component="p" />
                  <div className="button-group">
                      <label style={{textAlign: "left"}}>
                          <Link to="/create-account">
                              <div className="create-account-btn button">
                                  <Translate content="header.create_account" />
                              </div>
                          </Link>
                      </label>

                      <label style={{textAlign: "left"}}>
                          <Link to="/login">
                              <div className="login-btn button">
                                  <Translate content="header.unlock_short" />
                              </div>
                          </Link>
                      </label>
                  </div>
              </div>
          </div>
      </div>
    );
  }
}
