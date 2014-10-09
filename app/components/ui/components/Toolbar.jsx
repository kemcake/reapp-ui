var React = require('react');
var ReactStyle = require('react-style');
var GSSMixin = require('../../../mixins/GSSMixin');

var Toolbar = React.createClass({
  mixins: [GSSMixin],

  layout: `
    [top] == window[top];
    [left] == window[left];
    [right] == window[right];
    [height] == heading[instrinsic-height];
  `,

  styles: ReactStyle`
    font-size: 16px;
    background-color: #fff;
    text-align: center;
    border-bottom: 1px solid #ccc;
    padding: 12px;
    z-index: 100;
  `,

  render() {
    return (
      <div
        id={this.props.id || "_toolbar"}
        className="toolbar"
        styles={this.styles}>
        <span>{this.props.children}</span>
      </div>
    );
  }
});

module.exports = Toolbar;