var ReactStyle = require('react-style');
var Invariant = require('react/lib/invariant');
var emulateTouch = require('./lib/desktopTouch');

// Stores constants, animations and styles
//   see themes/ios/all.js for an example usage.

// Constants should be added before styles, they are
// passed into any styles file that returns a function.
// You can load multiple constants files, so if you'd
// like load the iOS theme, then override a few constants

// Styles are one big object, with each key mapping to a
// component/view's name. The values of those keys map
// to the refs within each component, and finally those
// values map to objects with styles.

// Styles compiled to ReactStyle objects on init.
// You can also load multiple styles objects, and order
// determines winner (last in applies).

// Finally, animations are an object. Their keys map to
// functions that take in (index, step, props).


var UI = module.exports = {
  styles: {},
  animations: {},
  constants: {},

  // constants are order sensitive and are overwritten on object
  addConstants(...constants) {
    constants.forEach(constant => {
      // allow functions, we pass in current constants
      if (typeof constant === 'function')
        constant = constant(UI.constants);

      Object.assign(UI.constants, constant);
    });
  },

  // simply unions a list of animations objects
  addAnimations(...animations) {
    animations.forEach(animation => {
      Object.keys(animation).forEach(key => {
        UI.animations[key] = animation[key];
      });
    });
  },

  // styles are order sensitive and pushed onto array
  addStyles(...styles) {
    styles.forEach(style => {
      // style: { styles: { key: requireFunc }, (include: [] | exclude: []) }
      var { styles, include, exclude } = style.styles ? style : { styles: style };
      var requireFunc = styles.__requireFunc;
      delete styles.__requireFunc;
      var styleKeys = Object.keys(styles);

      Invariant(!(include && exclude),
        'Cannot define include and exclude');

      // include or exclude certain styles
      UI._addStyles(requireFunc,
        include && include.length ?
          styleKeys.filter(x => include.indexOf(x) !== -1) :
          exclude && exclude.length ?
            styleKeys.filter(x => exclude.indexOf(x) === -1) :
            styleKeys
      );
    });
  },

  // do the actual adding
  // styles: { name: requireFunc }
  _addStyles(requireFunc, styles) {
    styles.forEach(key => {
      var style = requireFunc(key);
      if (typeof style === 'function')
        style = style(UI.constants);

      // make into ReactStyle
      Object.keys(style).forEach(styleKey => {
        UI.styles[key] = (UI.styles[key] || {});
        UI.styles[key][styleKey] = (UI.styles[key][styleKey] || [])
          .concat(ReactStyle(style[styleKey]));
      });
    });
  },

  // we just store key: true and __requireFunc: function
  // so webpack can conditionally require styles later
  makeStyles(requireFunc, components) {
    var styles = {};
    styles.__requireFunc = requireFunc;

    components.forEach(key => {
      styles[key] = true;
    });

    return styles;
  },

  // getters

  getStyles(name) {
    return name ? UI.styles[name] : UI.styles;
  },

  getConstants(name) {
    return name ? UI.constants[name] : UI.constants;
  },

  getAnimations(name) {
    return name ? UI.animations[name] : UI.animations;
  }
};