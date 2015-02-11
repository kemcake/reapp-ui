var supportsHairline = require('./supportsHairline')();

var brandColor = '#307cff';
var lightGray = supportsHairline ? '#d9d9dc' : '#ddd';
var midGray = '#bbb';

module.exports = {
  hairline: supportsHairline,
  onePx: supportsHairline ? '0.5px' : '1px',

  black: '#000',
  white: '#fff',
  lightGray: lightGray,
  midGray: midGray,
  darkGray: '#8e8e93',

  brandColor: brandColor,
  brandColorInactive: '#dcdbe2',

  active: brandColor,
  inactive: midGray,

  activeBG: brandColor,
  activeColor: '#fff',

  edgeWidth: 30
};