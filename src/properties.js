'use strict';

var utils = require('./utils.js');

const SCALAR = 1;
const ARRAY_2 = 2;
const ARRAY_3 = 3;

function fromPrefixed(name) {
  return 'from' + name.charAt(0).toUpperCase() + name.slice(1);
}

var tweenableProperties = {
  position: [ARRAY_3, [0, 0, 0]],
  rotation: [ARRAY_3, [0, 0, 0]],
  rotationPost: [ARRAY_3, [0, 0, 0]],
  skew: [ARRAY_2, [0, 0]],
  scale: [ARRAY_2, [1, 1]],
  scalePost: [ARRAY_2, [1, 1]],
  opacity: [SCALAR],
  width: [SCALAR],
  height: [SCALAR]
};

function preprocessOptions(options, index, len) {
  if (!options)
    return options;
  var clone = utils.cloneObject(options);

  var hasAllDoneCallback = utils.isFunction(options.allDone);
  var hasCompleteCallback = utils.isFunction(options.complete);

  if (hasCompleteCallback || hasAllDoneCallback) {
    clone.complete = function() {
      if (hasCompleteCallback) {
        options.complete.call(this, index, len);
      }
      if (hasAllDoneCallback && index === len - 1) {
        options.allDone();
      }
    };
  }

  if (utils.isFunction(options.valueFeeder)) {
    clone.valueFeeder = function(i, matrix) {
      return options.valueFeeder(i, matrix, index, len);
    };
  }
  if (utils.isFunction(options.easing)) {
    clone.easing = function(i) {
      return options.easing(i, index, len);
    };
  }
  if (utils.isFunction(options.start)) {
    clone.start = function() {
      return options.start(index, len);
    };
  }
  if (utils.isFunction(options.update)) {
    clone.update = function(i) {
      return options.update(i, index, len);
    };
  }

  var properties = Object.keys(tweenableProperties).concat(['perspective', 'transformOrigin', 'duration', 'delay']);

  properties.forEach(function(property) {
    var fromProperty = fromPrefixed(property);
    if (utils.isFunction(options[property])) {
      clone[property] = options[property](index, len);
    }
    if (utils.isFunction(options[fromProperty])) {
      clone[fromProperty] = options[fromProperty](index, len);
    }
  });

  return clone;
}

module.exports = {
  tweenableProperties: tweenableProperties,
  fromPrefixed: fromPrefixed,
  preprocessOptions: preprocessOptions,
  types: {
    SCALAR: SCALAR,
    ARRAY_2: ARRAY_2,
    ARRAY_3: ARRAY_3
  }
};
