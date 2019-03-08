import React from 'react';

class BurgerButton extends React.Component {
  constructor() {
    super();
  }

  render() {
    return(
      <div id="burgerIcon" className="burger-icon" onClick={this.props.onClick}>
        <div></div>
        <div></div>
        <div></div>
        <div className="right-burger-label">beta</div>

      </div>
    );
  }
}

export default BurgerButton;