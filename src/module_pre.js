(function (root, factory) {
  if (typeof exports === 'object') {
    // CommonJS
    module.exports = factory();
  } else if (typeof define === 'function' && define.amd) {
    // AMD
    define([], function () {
      return (root.returnExportsGlobal = factory());
    });
  } else {
    // Global Variables

    var snabbtjs = factory();
    root.snabbtjs = snabbtjs;
    root.snabbt = snabbtjs.snabbt;
    //root.returnExportsGlobal = factory();
  }
}(this, function () {

