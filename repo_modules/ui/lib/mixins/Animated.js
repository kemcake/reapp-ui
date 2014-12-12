var React = require('react');
var UI = require('../../index');
var StyleKeys = require('../StyleKeys');
var Invariant = require('react/lib/invariant');
var AnimateStore = require('../../stores/Animate');

var defined = variable => (typeof variable !== 'undefined');

module.exports = {
  contextTypes: {
    animateProps: React.PropTypes.object
  },

  componentWillMount() {
    this.setAnimations(this.props, this.state);
  },

  componentWillUpdate(nextProps) {
    if (!this.props.animations && !nextProps.animations)
      return;

    if (this.hasNewAnimations(nextProps))
      this.setAnimations(nextProps);
    else
      this.updateAnimations();
  },

  componentWillUnmount() {
    if (this._headStyleTag)
      document.head.removeChild(this._headStyleTag);
  },

  isAnimating(source) {
    return this.getAnimationProps(source).step % 1 !== 0;
  },

  getAnimation(name, animations) {
    animations = animations || this.props.animations;
    return animations.filter(a => a && a.name === name);
  },

  hasAnimation(name, animations) {
    animations = animations || this.props.animations;
    return animations && !!this.getAnimation(name, animations).length;
  },

  getAnimator(name) {
    return UI.getAnimations(name);
  },

  hasNewAnimations(nextProps) {
    var animations = nextProps.animations;

    if (!animations)
      return false;

    for (var i = 0, len = animations.length; i < len; i++)
      if (!this.isSameAnimation(animations[i], this.props.animations[i]))
        return true;

    return false;
  },

  setAnimations(props) {
    if (props.animations) {
      this._animations = {};

      props.animations.forEach(animation => {
        this._animations[animation.source] = Object.assign({},
          AnimateStore(animation.source, this._mountDepth) || {},
          props && props.animateProps && props.animateProps[animation.source] || {}
        );
      });
    }
  },

  // a slightly quicker version of setAnimations (ignores props)
  updateAnimations() {
    var newProps;

    this.props.animations.forEach(animation => {
      newProps = AnimateStore(animation.source, this._mountDepth);
      Object.assign(this._animations[animation.source], newProps);
    });
  },

  getAnimationProps(source) {
    return this._animations[source];
  },

  getAnimationStep(source) {
    return this.getAnimationProps(source).step;
  },

  setAnimationStyles(ref) {
    var styles = this.getAnimationStyles();

    if (!styles)
      return;

    var node = ref ?
      this.refs[ref].getDOMNode() :
      this.getDOMNode();

    var selector = node.id ?
      `#${node.id}.${node.className.split(' ').join('.')}` :
      `[data-reactid="${node.getAttribute('data-reactid')}"]`;

    var hasHeadStyleTag = !!this._headStyleTag;

    if (!hasHeadStyleTag)
      this._headStyleTag = document.createElement('style');

    // set tag styles
    this._headStyleTag.innerHTML =
      `${selector} {
        ${this.stylesToString(styles)}
      }`;

    if (!hasHeadStyleTag)
      document.head.appendChild(this._headStyleTag);
  },

  stylesToString(obj) {
    return Object.keys(obj).reduce(
      (acc, key) =>
        `${key}: ${obj[key]} !important;
         ${acc}`,
      '');
  },

  getAnimationStyles() {
    if (!this.props.animations)
      return;

    var styles = {};
    var transform;
    var firstTransform = true;
    var animation, i, len = this.props.animations.length;

    for (i = 0; i < len; i++) {
      animation = this.props.animations[i];

      if (!animation)
        continue;

      var { index, step, ...props } = this.getAnimationProps(animation.source);
      index = defined(index) ? index : 1;

      if (!animation.source && this.getTweeningValue && this.getTweeningValue('step'))
        step = this.getTweeningValue('step');

      if (!defined(step))
        continue; // throw new Error(`No step defined for animation ${source}`);

      var animator = this.getAnimator(animation.name);
      var { scale, rotate, rotate3d, translate, ...other } = animator(index, step, props);

      if (firstTransform && (defined(scale) || defined(rotate) || defined(rotate3d) || defined(translate))) {
        firstTransform = false;
        transform = { scale, rotate, rotate3d, translate };
      }
      else {
        this.mergeTransforms(transform, scale, rotate, rotate3d, translate);
      }

      if (other)
        Object.assign(styles, other);
    }

    if (transform)
      styles.transform = this.animationTransformsToString(transform);

    if (Object.keys(styles).length > 0)
      return styles;
    else
      return;
  },

  animationTransformsToString(transform) {
    if (!transform)
      return;

    var transformString = '';
    var t = transform;

    if (defined(t.scale))
      transformString += `scale(${t.scale}) `;

    if (defined(t.rotate3d))
      transformString += (
        rotate.x ? `rotateX(${t.rotate3d.x || 0}deg)` : '' +
        rotate.y ? `rotateY(${t.rotate3d.y || 0}deg)` : '' +
        rotate.z ? `rotateZ(${t.rotate3d.z || 0}deg)` : ''
      );

    if (defined(t.rotate))
      transformString += `rotate(${t.rotate}deg)`;

    if (defined(t.translate))
      transformString += `translate3d(${t.translate.x || 0}px, ${t.translate.y || 0}px, ${t.translate.z || 0}px)`;

    return transformString || 'translateZ(0px)';
  },

  mergeTransforms(transform, scale, rotate, rotate3d, translate) {
    if (defined(scale)) {
      if (!defined(transform.scale))
        transform.scale = 1;

      transform.scale += 1 - scale;
    }

    if (defined(rotate3d)) {
      if (!defined(transform.rotate3d))
        transform.rotate3d = { x: 0, y: 0, z: 0 };

      transform.rotate3d.x += (rotate3d.x || 0);
      transform.rotate3d.y += (rotate3d.y || 0);
      transform.rotate3d.z += (rotate3d.z || 0);
    }

    if (defined(rotate)) {
      transform.rotate = (transform.rotate || 0) + rotate;
    }

    if (defined(translate)) {
      if (!defined(transform.translate))
        transform.translate = { x: 0, y: 0, z: 0 };

      transform.translate.x += (translate.x || 0);
      transform.translate.y += (translate.y || 0);
      transform.translate.z += (translate.z || 0);
    }
  },

  isSameAnimation(a, b) {
    return a.name === b.name && a.source === b.source;
  }
};