// Steppers

var snabbtjs = snabbtjs || {};

snabbtjs.linear_easing = function(value) {
  return value;
};

snabbtjs.ease = function(value) {
  return (Math.cos(value*Math.PI + Math.PI) + 1)/2;
};

snabbtjs.ease_in = function(value) {
  return -Math.pow(value - 1, 2) + 1;
};

snabbtjs.ease_out = function(value) {
  return value*value;
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

snabbtjs.SpringEasing.prototype.tick = function(value) {
  if(value === 0.0)
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
  'ease': snabbtjs.ease,
  'ease-in': snabbtjs.ease_in,
  'ease-out': snabbtjs.ease_out,
};

snabbtjs.Easer = function(easer) {
  this.easer = easer;
  this._value = 0;
};

snabbtjs.Easer.prototype.tick = function(value) {
  this._value = this.easer(value);
  this.last_value = value;
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
  var ease_func;
  if(snabbtjs.is_function(easer_name)) {
    ease_func = easer_name;
  } else {
    ease_func = snabbtjs.EASING_FUNCS[easer_name];
  }
  return new snabbtjs.Easer(ease_func);
};
