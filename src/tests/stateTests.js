'use strict';

var expect = require('chai').expect;
var state = require('../state.js');
var props = require('../properties.js').tweenableProperties;
var types = require('../properties.js').types;

function generateRandomConfig() {
  var config = {};
  Object.keys(props).forEach((property) => {
    var type = props[property][0];

    if (type === types.SCALAR)
      config[property] = Math.random();
    if (type === types.ARRAY_2)
      config[property] = [Math.random(), Math.random()];
    if (type === types.ARRAY_3)
      config[property] = [Math.random(), Math.random(), Math.random()];
  });
  return config;
}

describe('state', () => {

  it('should assign properties from config', () => {
    var config = generateRandomConfig();
    var generatedState = state.createState(config);

    Object.keys(config).forEach(function(key) {
      expect(config[key]).to.equal(generatedState[key]);
    });
  });

  it('should clone properties', () => {
    var config = generateRandomConfig();
    var generatedState = state.createState(config);
    var clone = generatedState.clone();

    Object.keys(config).forEach(function(key) {
      expect(config[key]).to.equal(generatedState[key]);
      expect(clone[key]).to.eql(config[key]);

      if (!Number.isFinite(config[key])) {
        expect(clone[key]).to.not.equal(config[key]);
      }
    });
  });

  it('should return properties with units', () => {
    var generatedState = state.createState({
      width: 100,
      height: 100,
      opacity: 0.5
    });

    var properties = generatedState.getProperties();
    expect(properties).to.have.property('width', '100px');
    expect(properties).to.have.property('height', '100px');
    expect(properties).to.have.property('opacity', 0.5);
  });
});
