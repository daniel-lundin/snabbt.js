// Steppers
function pow2_easing(curr, max) {
  return Math.pow(curr/max, 0.5);
}

function linear_easing(curr, max) {
  return curr/max;
}

function cos_easing(curr, max) {
  return (Math.cos((curr/max)*Math.PI + Math.PI) + 1)/2;
}

function create_cubic_bezier_easing(p1, p2, p3, p4) {
  return function(curr, max) {
    var t = curr/max;
    return Math.pow(1-t, 3)*p1 + 3*Math.pow(1-t, 2)*t*p2 + 3*(1-t)*Math.pow(t, 2)*p3 + Math.pow(t, 3)*p4;
  }
}

function cubic_easing(curr, max) {
  var t = curr/max;
  return (Math.pow(2*t - 1, 3)+1)/2;
}

function cos_wooble_easing(curr, max) {
  var t = curr/max;
  return t*Math.cos(4*Math.PI*t);
}

function atan_easing(curr, max) {
  var t = curr/max;
  return (Math.atan(Math.PI*t - Math.PI/2) + 1)/2;
}

function sinc_wobbler_easing(curr, max) {
  var t = curr/max;
  var k = 5;
  return (-Math.sin(k*Math.PI*t)/(k*t) + Math.PI)/Math.PI;
}

var EASING_FUNCS = {
  'linear': linear_easing,
  'cubic': cubic_easing,
  'atan': atan_easing,
  'cos': cos_easing,
  'sinc_wobbler': sinc_wobbler_easing
};
