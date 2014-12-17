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

snabbtjs.sqrt_easing = function(curr, max) {
  var t = curr/max;
  return (Math.pow(t, 0.5));
};

snabbtjs.sinc_wobbler_easing = function (curr, max) {
  var t = curr/max;
  var k = 5;
  return (-Math.sin(k*Math.PI*t)/(k*t) + Math.PI)/Math.PI;
};

snabbtjs.sinc2 = function(curr, max) {
  var t = curr/max;
  return 1 - Math.sin(20*Math.PI*t)/(20*Math.PI*t);
};

snabbtjs.exp_cos = function(curr, max) {
  var t = curr/max;
  return 1 + Math.exp(-5*t) * Math.cos(4*Math.PI*t);
};

snabbtjs.exp_cos_bounce = function(curr, max) {
  var t = curr/max;
  return 1 -  Math.abs(Math.exp(-5*t) * Math.cos(4*Math.PI*t));
};

snabbtjs.SpringEasing = function(options) {
  this.position = snabbtjs.option_or_default(options.start_position, 0);
  this.equilibrium_position = snabbtjs.option_or_default(options.equilibrium_position, 1);
  this.velocity = snabbtjs.option_or_default(options.initial_velocity, 0);
  this.spring_constant = snabbtjs.option_or_default(options.spring_constant, 0.8);
  this.deacceleration = snabbtjs.option_or_default(options.spring_deacceleration, 0.9);
  this.mass = snabbtjs.option_or_default(options.spring_mass, 10);

  this.equilibrium = false;
};

snabbtjs.SpringEasing.prototype.tick = function(curr, max) {
  if(curr === 0.0)
    return;
  if(this.equilibrium)
    return;
  var spring_force = -(this.position - this.equilibrium_position) * this.spring_constant;
  // f = m * a
  // a = f / m
  var a = spring_force / this.mass;
  // s = v * t
  // t = 1 ( for now )
  this.velocity += a;
  this.position += this.velocity;

  // Deacceleartion
  this.velocity *= this.deacceleration;

  if(Math.abs(this.position - this.equilibrium_position) < 0.001 && Math.abs(this.velocity) < 0.001) {
    this.equilibrium = true;
  }
};

snabbtjs.SpringEasing.prototype.value = function() {
  return this.position;
};

snabbtjs.SpringEasing.prototype.completed = function() {
  return this.equilibrium;
};

snabbtjs.EASING_FUNCS = {
  'linear': snabbtjs.linear_easing,
  'square': snabbtjs.pow2_easing,
  'sqrt': snabbtjs.sqrt_easing,
  'cos': snabbtjs.cos_easing,
  'exp_cos_bounce': snabbtjs.exp_cos_bounce,
  'exp_cos': snabbtjs.exp_cos,
  'sinc_wobbler': snabbtjs.sinc_wobbler_easing,
};

snabbtjs.Easer = function(easer) {
  this.easer = easer;
  this._value = 0;
};

snabbtjs.Easer.prototype.tick = function(curr, max) {
  this._value = this.easer(curr, max);
  this.last_value = curr/max;
};

snabbtjs.Easer.prototype.value = function() {
  return this._value;
};

snabbtjs.Easer.prototype.completed = function() {
  return this.last_value >= 1;
};

snabbtjs.create_easer = function(easer_name, options) {
  if(easer_name == 'spring') {
    return new snabbtjs.SpringEasing(options);
  }
  var ease_func = snabbtjs.EASING_FUNCS[easer_name];
  return new snabbtjs.Easer(ease_func);
};
