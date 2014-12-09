var Component = require('ui/component');
var TweenState = require('react-tween-state');
var AcceptsContexts = require('../mixins/AcceptsContexts');

module.exports = Component('Icon', {
  mixins: [TweenState.Mixin, AcceptsContexts('viewList')],

  getDefaultProps() {
    return {
      size: 32,
      color: 'currentColor',
      style: {},
      svgProps: {}
    };
  },

  componentWillReceiveProps(nextProps) {
    if (this.hasAnimation('rotate') && !this.state.isRotating) {
      this.setState({ step: 0, isRotating: true });
      this.rotate();
    }
    else {
      this.setState({ isRotating: false });
    }
  },

  rotate() {
    this.tweenState('step', {
      easing: TweenState.easingTypes.linear,
      endValue: 1,
      duration: 1500,
      onEnd: () => {
        this.setState({ step: 0 });

        if (this.state.isRotating)
          this.rotate();
      }
    });
  },

  render() {
    var {
      animations,
      size,
      type,
      color,
      stroke,
      shapeRendering,
      svgProps,
      ...props
    } = this.props;

    svgProps = Object.assign({
      style: Object.assign({
        width: size,
        height: size,
        shapeRendering: shapeRendering ? shapeRendering : 'initial',
        fill: 'currentColor'
      }, svgProps.style),
      viewBox: '0 0 64 64',
      fill: color
    }, svgProps);

    if (stroke) {
      Object.assign(svgProps, {
        stroke: color,
        strokeWidth: stroke * 4, // were scaling down from 64 / 2
        strokeLinecap: 'round'
      });
    }

    Object.assign(props.style, {
      color: color,
      width: size,
      height: size,
      overflow: 'hidden'
    }, props.style);

    if (animations)
      props.style = this.getAnimationStyles(animations);

    return (
      <span {...props} {...this.componentProps()}>
        <svg {...svgProps}>
          <g dangerouslySetInnerHTML={{__html:
            '<use xlink:href="/assets/icons/svg/'+ type +'.svg#Layer_1"></use>'
          }} />
        </svg>
      </span>
    );
  }

});