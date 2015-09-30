'use strict';

const SCALAR = 1;
const ARRAY_2 = 2;
const ARRAY_3 = 3;

function fromPrefixed(name) {
  return 'from' + name.charAt(0).toUpperCase() + name.slice(1);
}

var tweenableProperties = {
  position: [ARRAY_3, [0, 0, 0]],
  rotation: [ARRAY_3, [0, 0, 0]],
  rotationPost: [ARRAY_3, [0, 0, 0]],
  skew: [ARRAY_2, [0, 0]],
  scale: [ARRAY_2, [1, 1]],
  scalePost: [ARRAY_2, [1, 1]],
  opacity: [SCALAR],
  width: [SCALAR],
  height: [SCALAR]
};


module.exports = {
  tweenableProperties: tweenableProperties,
  fromPrefixed: fromPrefixed,
  types: {
    SCALAR: SCALAR,
    ARRAY_2: ARRAY_2,
    ARRAY_3: ARRAY_3
  }
};
