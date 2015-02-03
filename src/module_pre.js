(function (root, factory) {
  var snabbtjs = factory();
  // Expose Matrix class and some other things that could be useful
  snabbtjs.snabbt.Matrix = snabbtjs.Matrix;
  snabbtjs.snabbt.setElementTransform = snabbtjs.updateElementTransform;

  if (typeof exports === 'object') {
    // CommonJS
    module.exports = snabbtjs.snabbt;
  } else if (typeof define === 'function' && define.amd) {
    // AMD
    define([], function () {
      return (root.returnExportsGlobal = snabbtjs.snabbt);
    });
  } else {
    // Global Variables

    root.snabbt = snabbtjs.snabbt;
  }
}(this, function () {

