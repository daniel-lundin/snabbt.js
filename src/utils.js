'use strict';

function isFunction(object) {
  return typeof object === 'function';
}

function optionOrDefault(option, def) {
  if (option === undefined) {
    return def;
  }
  return option;
}

function updateElementTransform(element, matrix, transformProperty, perspective) {
  var cssPerspective = '';
  if (perspective) {
    cssPerspective = 'perspective(' + perspective + 'px) ';
  }
  var cssMatrix = matrix.asCSS();
  //element.style[transformProperty] = cssPerspective + cssMatrix;
  element.style.transform = cssPerspective + cssMatrix;
}

var updateElementProperties = function(element, properties) {
  for (var key in properties) {
    if (key === 'perspective') // TODO: Fix this
      continue;
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
  optionOrDefault: optionOrDefault,
  updateElementTransform: updateElementTransform,
  updateElementProperties: updateElementProperties,
  isFunction: isFunction,
  cloneObject: cloneObject
};
