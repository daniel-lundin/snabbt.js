'use strict';

var createMatrix = require('./matrix.js');
var props = require('./properties').tweenableProperties;
var types = require('./properties').types;

function createStateTweener(startState, endState, resultState) {
  var start = startState;
  var end = endState;
  var result = resultState;

  var tweenProps = [];
  Object.keys(props).forEach((prop) => {
    if (endState[prop] !== undefined) {
      tweenProps.push(prop);
    }
  });

  function tween3D(from, to, res, prop, tweenValue) {
      var dX = to[prop][0] - from[prop][0];
      var dY = to[prop][1] - from[prop][1];
      var dZ = to[prop][2] - from[prop][2];
      res[prop][0] = from[prop][0] + tweenValue * dX;
      res[prop][1] = from[prop][1] + tweenValue * dY;
      res[prop][2] = from[prop][2] + tweenValue * dZ;
  }

  function tween2D(from, to, res, prop, tweenValue) {
      var dX = to[prop][0] - from[prop][0];
      var dY = to[prop][1] - from[prop][1];
      res[prop][0] = from[prop][0] + tweenValue * dX;
      res[prop][1] = from[prop][1] + tweenValue * dY;
  }

  function tweenScalar(from, to, res, prop, tweenValue) {
      var dX = to[prop] - from[prop];
      res[prop] = from[prop] + tweenValue * dX;
  }
  // Public API
  return {

    tween(tweenValue) {

      tweenProps.forEach((prop) => {
        const type = props[prop][0];
        if (type === types.ARRAY_3) {
          tween3D(start, end, result, prop, tweenValue);
        } else if (type === types.ARRAY_2) {
          tween2D(start, end, result, prop, tweenValue);
        } else {
          tweenScalar(start, end, result, prop, tweenValue);
        }

      });
    },

    asMatrix() {
      return result.asMatrix();
    },

    getProperties() {
      return result.getProperties();
    },

    result() {
      return result;
    },

    setReverse() {
      var oldStart = start;
      start = end;
      end = oldStart;
    }
  };
}

function createValueFeederTweener(valueFeeder, startState, endState, resultState) {
  var currentMatrix = valueFeeder(0, createMatrix());
  var start = startState;
  var end = endState;
  var result = resultState;
  var reverse = false;

  // Public API
  return {
    tween(tweenValue) {
      if (reverse)
        tweenValue = 1 - tweenValue;
      currentMatrix.clear();
      currentMatrix = valueFeeder(tweenValue, currentMatrix);

      var dWidth = end.width - start.width;
      var dHeight = end.height - start.height;
      var dOpacity = end.opacity - start.opacity;

      if (end.width !== undefined)
        result.width = start.width + tweenValue * dWidth;
      if (end.height !== undefined)
        result.height = start.height + tweenValue * dHeight;
      if (end.opacity !== undefined)
        result.opacity = start.opacity + tweenValue * dOpacity;
    },

    asMatrix() {
      return currentMatrix;
    },

    getProperties() {
      return result.getProperties();
    },

    setReverse() {
      reverse = true;
    }
  };
}

module.exports = {
  createStateTweener: createStateTweener,
  createValueFeederTweener: createValueFeederTweener
};
