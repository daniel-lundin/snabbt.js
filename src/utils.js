'use strict';

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

function cloneObject(object) {
  if (!object)
    return object;
  var clone = {};
  for (var key in object) {
    clone[key] = object[key];
  }
  return clone;
}

module.exports = {
  preprocessOptions: preprocessOptions,
  optionOrDefault: optionOrDefault,
  updateElementTransform: updateElementTransform,
  updateElementProperties: updateElementProperties,
  isFunction: isFunction,
  cloneObject: cloneObject
};
