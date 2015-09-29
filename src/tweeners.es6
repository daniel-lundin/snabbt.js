'use strict';

var matrix = require('./matrix.es6');

function createStateTweener(startState, endState, resultState) {
  var start = startState;
  var end = endState;
  var result = resultState;

  var tweenPosition = end.position !== undefined;
  var tweenRotation = end.rotation !== undefined;
  var tweenRotationPost = end.rotationPost !== undefined;
  var tweenScale = end.scale !== undefined;
  var tweenScalePost = end.scalePost !== undefined;
  var tweenSkew = end.skew !== undefined;
  var tweenWidth = end.width !== undefined;
  var tweenHeight = end.height !== undefined;
  var tweenOpacity = end.opacity !== undefined;

  // Public API
  return {

    tween(tweenValue) {

      if (tweenPosition) {
        var dX = end.position[0] - start.position[0];
        var dY = end.position[1] - start.position[1];
        var dZ = end.position[2] - start.position[2];
        result.position[0] = start.position[0] + tweenValue * dX;
        result.position[1] = start.position[1] + tweenValue * dY;
        result.position[2] = start.position[2] + tweenValue * dZ;
      }

      if (tweenRotation) {
        var dAX = end.rotation[0] - start.rotation[0];
        var dAY = end.rotation[1] - start.rotation[1];
        var dAZ = end.rotation[2] - start.rotation[2];
        result.rotation[0] = start.rotation[0] + tweenValue * dAX;
        result.rotation[1] = start.rotation[1] + tweenValue * dAY;
        result.rotation[2] = start.rotation[2] + tweenValue * dAZ;
      }

      if (tweenRotationPost) {
        var dBX = end.rotationPost[0] - start.rotationPost[0];
        var dBY = end.rotationPost[1] - start.rotationPost[1];
        var dBZ = end.rotationPost[2] - start.rotationPost[2];
        result.rotationPost[0] = start.rotationPost[0] + tweenValue * dBX;
        result.rotationPost[1] = start.rotationPost[1] + tweenValue * dBY;
        result.rotationPost[2] = start.rotationPost[2] + tweenValue * dBZ;
      }

      if (tweenSkew) {
        var dSkewX = end.skew[0] - start.skew[0];
        var dSkewY = end.skew[1] - start.skew[1];

        result.skew[0] = start.skew[0] + tweenValue * dSkewX;
        result.skew[1] = start.skew[1] + tweenValue * dSkewY;
      }

      if (tweenScale) {
        var dSX = end.scale[0] - start.scale[0];
        var dSY = end.scale[1] - start.scale[1];

        result.scale[0] = start.scale[0] + tweenValue * dSX;
        result.scale[1] = start.scale[1] + tweenValue * dSY;
      }

      if (tweenScalePost) {
        var dSXPost = end.scalePost[0] - start.scalePost[0];
        var dSYPost = end.scalePost[1] - start.scalePost[1];

        result.scalePost[0] = start.scalePost[0] + tweenValue * dSXPost;
        result.scalePost[1] = start.scalePost[1] + tweenValue * dSYPost;
      }


      if (tweenWidth) {
        var dWidth = end.width - start.width;
        result.width = start.width + tweenValue * dWidth;
      }

      if (tweenHeight) {
        var dHeight = end.height - start.height;
        result.height = start.height + tweenValue * dHeight;
      }

      if (tweenOpacity) {
        var dOpacity = end.opacity - start.opacity;
        result.opacity = start.opacity + tweenValue * dOpacity;
      }
    },

    asMatrix() {
      return result.asMatrix();
    },

    getProperties() {
      return result.getProperties();
    },

    setReverse() {
      var oldStart = start;
      start = end;
      end = oldStart;
    }
  };
}

function createValueFeederTweener(valueFeeder, startState, endState, resultState) {
  var currentMatrix = valueFeeder(0, matrix.createMatrix());
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
