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

function updateElementTransform(element, matrix, transformProperty, perspective, staticTransform) {
  var cssPerspective = perspective ? 'perspective(' + perspective + 'px) ' : '';
  var cssMatrix = matrix.asCSS();
  var cssStaticTransform = staticTransform ? staticTransform : '';
  if (transformProperty)
    element.style[transformProperty] = cssStaticTransform + cssPerspective + cssMatrix;
  else
    element.style.transform = cssStaticTransform + cssPerspective + cssMatrix;
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

function findUltimateAncestor(node) {
  var ancestor = node;
  while (ancestor.parentNode) {
    ancestor = ancestor.parentNode;
  }
  return ancestor;
}

module.exports = {
  optionOrDefault: optionOrDefault,
  updateElementTransform: updateElementTransform,
  updateElementProperties: updateElementProperties,
  isFunction: isFunction,
  cloneObject: cloneObject,
  findUltimateAncestor: findUltimateAncestor
};
