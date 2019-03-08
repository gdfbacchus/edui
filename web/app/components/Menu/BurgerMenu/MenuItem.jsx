import React from 'react';

var MenuItem = React.createClass({
  navigate: function() {
    this.props.onClick(this.props.hash);
  },

  render: function() {
    return <div className= {this.props.firstItem ? "burger-menu-item first-burger-menu-item" : "burger-menu-item" }onClick={this.navigate} >{this.props.children}</div>;
  }
});

export default MenuItem;