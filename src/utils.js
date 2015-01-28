var snabbtjs = snabbtjs || {};

snabbtjs.optionOrDefault = function(option, def) {
  if(typeof option == 'undefined') {
    return def;
  }
  return option;
};

snabbtjs.setTransformOrigin = function(element, transformOrigin) {
  if(transformOrigin) {
    element.style.webkitTransformOrigin = transformOrigin;
    element.style.transformOrigin = transformOrigin;
  }
};

snabbtjs.updateElementTransform = function(element, matrix, perspective) {
  var cssPerspective = '';
  if(perspective) {
    cssPerspective = 'perspective(' + perspective + 'px) ';
  }
  element.style.webkitTransform = cssPerspective + snabbtjs.matrixToCSS(matrix);
  element.style.transform = cssPerspective + snabbtjs.matrixToCSS(matrix);
};

snabbtjs.updateElementProperties = function(element, properties) {
  for(var key in properties) {
    element.style[key] = properties[key];
  }
};


snabbtjs.isFunction = function(object) {
  return (typeof object === "function");
};
