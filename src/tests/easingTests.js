'use strict';

var expect = require('chai').expect;
var easing = require('../easing.js');

describe('easing', () => {
  it('should create easer', () => {
    var easer = easing.createEaser('ease');

    expect(easer).to.have.property('tick');
    expect(easer).to.have.property('getValue');
    expect(easer).to.have.property('completed');
    expect(easer).to.have.property('resetFrom');
  });

  it('should create spring easer', () => {
    var springOptions = {
      springConstant: 1,
      springDeceleration: 0.9
    };

    var easer = easing.createEaser('spring', springOptions);

    expect(easer).to.have.property('isSpring', true);
  });

  it('should reach equilibrium for spring easings', () => {
    var springOptions = {
      springConstant: 1,
      springDeceleration: 0.9
    };

    var easer = easing.createEaser('spring', springOptions);

    expect(easer.completed()).to.not.be.ok;
    while (!easer.completed()) {
      easer.tick();
    }
    expect(easer.completed()).to.be.ok;
  });
});
