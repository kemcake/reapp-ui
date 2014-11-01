var React = require('react');
var ViewList = require('./ViewList');

var ParallaxViewList = React.createClass({
  render() {
    var width = this.props.width || window.innerWidth;
    var parallaxProps = {
      transform: 'VIEW_PARALLAX',
      touchStartBounds: {
        // touchable only on the edges
        x: [
          { from: 0, to: 10 },
          { from: width-10, to: width }
        ]
      }
    };

    var props = Object.assign({}, parallaxProps, this.props);
    return ViewList(props);
  }
});

module.exports = ParallaxViewList;