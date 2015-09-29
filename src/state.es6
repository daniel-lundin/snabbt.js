'use strict';

var matrix = require('./matrix.es6');

function createState(config) {
  var m = matrix.createMatrix();
  var properties = {
    opacity: undefined,
    width: undefined,
    height: undefined
  };

  // Public API
  return {
    position: config.position,
    rotation: config.rotation,
    rotationPost: config.rotationPost,
    skew: config.skew,
    scale: config.scale,
    scalePost: config.scalePost,
    opacity: config.opacity,
    width: config.width,
    height: config.height,


    clone() {
      return createState({
        position: this.position ? this.position.slice(0) : undefined,
        rotation: this.rotation ? this.rotation.slice(0) : undefined,
        rotationPost: this.rotationPost ? this.rotationPost.slice(0) : undefined,
        skew: this.skew ? this.skew.slice(0) : undefined,
        scale: this.scale ? this.scale.slice(0) : undefined,
        scalePost: this.scalePost ? this.scalePost.slice(0) : undefined,
        height: this.height,
        width: this.width,
        opacity: this.opacity
      });
    },

    asMatrix() {
      m.clear();

      if (this.transformOrigin)
        m.translate(-this.transformOrigin[0], -this.transformOrigin[1], -this.transformOrigin[2]);

      if (this.scale) {
        m.scale(this.scale[0], this.scale[1]);
      }

      if (this.skew) {
        m.skew(this.skew[0], this.skew[1]);
      }

      if (this.rotation) {
        m.rotateX(this.rotation[0]);
        m.rotateY(this.rotation[1]);
        m.rotateZ(this.rotation[2]);
      }

      if (this.position) {
        m.translate(this.position[0], this.position[1], this.position[2]);
      }

      if (this.rotationPost) {
        m.rotateX(this.rotationPost[0]);
        m.rotateY(this.rotationPost[1]);
        m.rotateZ(this.rotationPost[2]);
      }

      if (this.scalePost) {
        m.scale(this.scalePost[0], this.scalePost[1]);
      }

      if (this.transformOrigin)
        m.translate(this.transformOrigin[0], this.transformOrigin[1], this.transformOrigin[2]);
      return m;
    },

    getProperties: function() {
      properties.opacity = this.opacity;
      properties.width = this.width + 'px';
      properties.height = this.height + 'px';
      return properties;
    }
  };
}

module.exports = createState;
