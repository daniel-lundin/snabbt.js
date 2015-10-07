'use strict';
/* global window */

var Engine = require('./engine.js');

module.exports.snabbt = function(element, options) {
  Engine.initializeAnimation(element, options);
};

if (window) {
  window.snabbt = function(element, options) {
    Engine.initializeAnimation(element, options);
  };
}
