var snabbtjs = snabbtjs || {};

snabbtjs.option_or_default = function(option, def) {
  if(typeof option == 'undefined') {
    return def;
  }
  return option;
};
