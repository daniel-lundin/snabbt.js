'use strict';
/* global window */

var Engine = require('./engine.js');
var preprocessOptions = require('./properties.js').preprocessOptions;

function snabbt(elements, arg2, arg3) {
  if (!elements.length) {
    if (typeof arg2 === 'string')
      return Engine.initializeAnimation(elements, arg2, preprocessOptions(arg3, 0, 1));
    return Engine.initializeAnimation(elements, preprocessOptions(arg2, 0, 1), arg3);
  }

  var chainers = [];
  var aggregateChainer = {
    snabbt(opts) {
      var len = chainers.length;
      chainers.forEach(function(chainer, index) {
        chainer.snabbt(preprocessOptions(opts, index, len));
      });
      return aggregateChainer;
    },
    setValue(value) {
      chainers.forEach(function(chainer) {
        chainer.setValue(value);
      });
      return aggregateChainer;
    },
    finish() {
      chainers.forEach(function(chainer) {
        chainer.finish();
      });
      return aggregateChainer;
    },
    rollback() {
      chainers.forEach(function(chainer) {
        chainer.rollback();
      });
      return aggregateChainer;
    }
  };

  for (var i = 0, len = elements.length; i < len; ++i) {
    if (typeof arg2 === 'string')
      chainers.push(Engine.initializeAnimation(elements[i], arg2, preprocessOptions(arg3, i, len)));
    else
      chainers.push(Engine.initializeAnimation(elements[i], preprocessOptions(arg2, i, len), arg3));
  }
  //console.log('returning aggregate chainer', aggregateChainer);
  return aggregateChainer;
}
module.exports.snabbt = function(element, arg2, arg3) {
  return snabbt(element, arg2, arg3);
  //Engine.initializeAnimation(element, options);
};

if (typeof window !== 'undefined') {
  window.snabbt = function(element, options) {
    return Engine.initializeAnimation(element, options);
  };
}
