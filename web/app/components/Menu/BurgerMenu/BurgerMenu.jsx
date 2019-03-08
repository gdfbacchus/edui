import React from 'react';

class Menu extends React.Component {
  constructor() {
    super();
    this.state = {
      visible: false
    };
    this.show = this.show.bind(this);
    this.hide = this.hide.bind(this);

  }

  show() {
    this.setState({ visible: true });
    document.getElementById('burgerIcon').addEventListener("click", this.show.bind(this));
    //document.addEventListener("click", this.show.bind(this));
  }

  hide() {
    document.getElementById('burgerIcon').removeEventListener("click", this.hide.bind(this));
    this.setState({ visible: false });
  }

  render() {
    return (
      <div className="burger-menu">
        <div className={(this.state.visible ? "visible " : "") + this.props.alignment}>
          {this.props.children}
        </div>
      </div>
    );
  }
}
export default Menu;