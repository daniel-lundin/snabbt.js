// Steppers

var snabbtjs = snabbtjs || {};


snabbtjs.pow2_easing = function(curr, max) {
  var t = curr/max;
  return t*t;
};

snabbtjs.linear_easing = function(curr, max) {
  return curr/max;
};

snabbtjs.cos_easing = function(curr, max) {
  return (Math.cos((curr/max)*Math.PI + Math.PI) + 1)/2;
};

snabbtjs.create_cubic_bezier_easing = function(p0x, p0y, p1x, p1y) {
  return function(curr, max) {
    var t = curr/max;
    return 3*Math.pow(1-t, 2)*t*(p0x + p0y) + 3*(1-t)*Math.pow(t, 2)*(p1x + p1y) + Math.pow(t, 3);
    //return 3*Math.pow(1-t, 2)*t*(p0y) + 3*(1-t)*Math.pow(t, 2)*(p1y) + Math.pow(t, 3);
  };
};

snabbtjs.cubic_easing = function(curr, max) {
  var t = curr/max;
  return (Math.pow(2*t - 1, 3)+1)/2;
};

snabbtjs.sqrt_easing = function(curr, max) {
  var t = curr/max;
  return (Math.pow(t, 0.5));
};

snabbtjs.cos_wooble_easing = function (curr, max) {
  var t = curr/max;
  return t*Math.cos(4*Math.PI*t);
};

snabbtjs.atan_easing = function (curr, max) {
  var t = curr/max;
  return (Math.atan(Math.PI*t - Math.PI/2) + 1)/2;
};

snabbtjs.sinc_wobbler_easing = function (curr, max) {
  var t = curr/max;
  var k = 5;
  return (-Math.sin(k*Math.PI*t)/(k*t) + Math.PI)/Math.PI;
};

snabbtjs.sinc2_wobbler_easing = function (curr, max) {
  var t = curr/max;
  var k = 4*Math.PI*Math.pow(t, 2);
  return (1 - Math.sin(k)/k);
};

snabbtjs.sinc2 = function(curr, max) {
  var t = curr/max;
  return 1 - Math.sin(20*Math.PI*t)/(20*Math.PI*t);
};

snabbtjs.EASING_FUNCS = {
  'linear': snabbtjs.linear_easing,
  'cubic': snabbtjs.cubic_easing,
  'square': snabbtjs.pow2_easing,
  'sqrt': snabbtjs.sqrt_easing,
  'atan': snabbtjs.atan_easing,
  'cos': snabbtjs.cos_easing,
  'sinc_wobbler': snabbtjs.sinc_wobbler_easing,
  'sinc2_wobbler': snabbtjs.sinc2_wobbler_easing,
};
