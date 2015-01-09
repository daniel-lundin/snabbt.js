(function (root, factory) {
  if (typeof exports === 'object') {
    // CommonJS
    module.exports = factory().snabbt;
  } else if (typeof define === 'function' && define.amd) {
    // AMD
    define([], function () {
      return (root.returnExportsGlobal = factory().snabbt);
    });
  } else {
    // Global Variables

    root.snabbt = factory().snabbt;
  }
}(this, function () {

