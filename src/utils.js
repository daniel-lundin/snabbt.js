var snabbtjs = snabbtjs || {};

snabbtjs.option_or_default = function(option, def) {
  if(typeof option == 'undefined') {
    return def;
  }
  return option;
};

snabbtjs._update_element_transform = function(element, matrix, perspective) {
  var css_perspective = '';
  if(perspective) {
    css_perspective = 'perspective(' + perspective + 'px) ';
  }
  element.style.webkitTransform = css_perspective + snabbtjs.mat_to_css(matrix);
  element.style.transform = css_perspective + snabbtjs.mat_to_css(matrix);
};

snabbtjs.update_element_transform = function(element, matrix, perspective) {
  if(element.hasOwnProperty('length')) {
    for(var i=0;i<element.length;++i) {
      snabbtjs._update_element_transform(element[i], matrix, perspective);
    }
  } else {
    snabbtjs._update_element_transform(element, matrix, perspective);
  }
};

snabbtjs._update_element_properties = function(element, properties) {
  for(var key in properties) {
    element.style[key] = properties[key];
  }
};

snabbtjs.update_element_properties = function(element, properties) {
  if(element.hasOwnProperty('length')) {
    for(var i=0;i<element.length;++i) {
      snabbtjs._update_element_properties(element[i], properties);
    }
  } else {
    snabbtjs._update_element_properties(element, properties);
  }
};

snabbtjs.is_function = function(object) {
  return (typeof object === "function");
  //return object && getClass.call(object) == '[object Function]';
};
