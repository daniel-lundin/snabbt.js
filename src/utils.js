var snabbtjs = snabbtjs || {};

snabbtjs.optionOrDefault = function(option, def) {
  if(typeof option == 'undefined') {
    return def;
  }
  return option;
};

snabbtjs.updateElementTransform = function(element, matrix, perspective) {
  var cssPerspective = '';
  if(perspective) {
    cssPerspective = 'perspective(' + perspective + 'px) ';
  }
  var cssMatrix = matrix.asCSS();
  element.style.webkitTransform = cssPerspective + cssMatrix;
  element.style.transform = cssPerspective + cssMatrix;
};

snabbtjs.updateElementProperties = function(element, properties) {
  for(var key in properties) {
    element.style[key] = properties[key];
  }
};

snabbtjs.isFunction = function(object) {
  return (typeof object === "function");
};

snabbtjs.cloneObject = function(object) {
  if(!object)
    return object;
  var clone = {};
  for(var key in object) {
    clone[key] = object[key];
  }
  return clone;
};
