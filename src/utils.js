'use strict';

var createState = require('./state.js').createState;

function isFunction(object) {
  return typeof object === 'function';
}

function preprocessOptions(options, index, len) {
  if (!options)
    return options;
  var clone = cloneObject(options);

  if (isFunction(options.delay)) {
    clone.delay = options.delay(index, len);
  }

  var hasAllDoneCallback = isFunction(options.allDone);
  var hasCompleteCallback = isFunction(options.complete);

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

  if (isFunction(options.valueFeeder)) {
    clone.valueFeeder = function(i, matrix) {
      return options.valueFeeder(i, matrix, index, len);
    };
  }
  if (isFunction(options.easing)) {
    clone.easing = function(i) {
      return options.easing(i, index, len);
    };
  }

  var properties = [
    'position',
    'rotation',
    'skew',
    'rotationPost',
    'scale',
    'scalePost',
    'width',
    'height',
    'opacity',
    'fromPosition',
    'fromRotation',
    'fromSkew',
    'fromRotationPost',
    'fromScale',
    'fromScalePost',
    'fromWidth',
    'fromHeight',
    'fromOpacity',
    'transformOrigin',
    'duration',
    'delay'
  ];

  properties.forEach(function(property) {
    if (isFunction(options[property])) {
      clone[property] = options[property](index, len);
    }
  });

  return clone;
}

function optionOrDefault(option, def) {
  if (option === undefined) {
    return def;
  }
  return option;
}

function updateElementTransform(element, matrix, perspective, transformProperty) {
  var cssPerspective = '';
  if (perspective) {
    cssPerspective = 'perspective(' + perspective + 'px) ';
  }
  var cssMatrix = matrix.asCSS();
  element.style[transformProperty] = cssPerspective + cssMatrix;
}

var updateElementProperties = function(element, properties) {
  for (var key in properties) {
    element.style[key] = properties[key];
  }
};

var cloneObject = function(object) {
  if (!object)
    return object;
  var clone = {};
  for (var key in object) {
    clone[key] = object[key];
  }
  return clone;
};

var stateFromOptions = function(options, state, useFromPrefix) {
  if (!state) {
    state = createState({
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      rotationPost: [0, 0, 0],
      scale: [1, 1],
      scalePost: [1, 1],
      skew: [0, 0]
    });
  }
  var position = 'position';
  var rotation = 'rotation';
  var skew = 'skew';
  var rotationPost = 'rotationPost';
  var scale = 'scale';
  var scalePost = 'scalePost';
  var width = 'width';
  var height = 'height';
  var opacity = 'opacity';

  if (useFromPrefix) {
    position = 'fromPosition';
    rotation = 'fromRotation';
    skew = 'fromSkew';
    rotationPost = 'fromRotationPost';
    scale = 'fromScale';
    scalePost = 'fromScalePost';
    width = 'fromWidth';
    height = 'fromHeight';
    opacity = 'fromOpacity';
  }

  state.position = optionOrDefault(options[position], state.position);
  state.rotation = optionOrDefault(options[rotation], state.rotation);
  state.rotationPost = optionOrDefault(options[rotationPost], state.rotationPost);
  state.skew = optionOrDefault(options[skew], state.skew);
  state.scale = optionOrDefault(options[scale], state.scale);
  state.scalePost = optionOrDefault(options[scalePost], state.scalePost);
  state.opacity = options[opacity];
  state.width = options[width];
  state.height = options[height];

  return state;
};

module.exports = {
  preprocessOptions: preprocessOptions,
  optionOrDefault: optionOrDefault,
  updateElementTransform: updateElementTransform,
  updateElementProperties: updateElementProperties,
  isFunction: isFunction,
  cloneObject: cloneObject,
  stateFromOptions: stateFromOptions
};
