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
