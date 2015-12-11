'use strict';
/* global snabbt, randomColor, window, document, FPSMeter */

(function(window, snabbt) {

  var stickCount = 100;
  var radius = 0.8 * (window.innerWidth / 4);

  function init() {
    setupFpsMeters();
    var colors = randomColor({
      count: 7,
      luminosity: 'dark',
      format: 'rgb'
    });

    if (window.innerWidth < 600) {
      stickCount = 40;
      document.getElementById('heading').innerText = '80 DOM elements';
    }


    // Layout
    var c1 = document.getElementById('c1');
    c1.style.top = window.innerHeight / 2 + 'px';
    c1.style.left = 3 * (window.innerWidth / 4) - 25 + 'px';
    var c2 = document.getElementById('c2');
    c2.style.top = window.innerHeight / 2 + 'px';
    c2.style.left = window.innerWidth / 4 - 25 + 'px';

    function setupSticks(root) {
      for (var i = 0; i < stickCount; ++i) {
        var stick = document.createElement('div');
        stick.className = 'stick';
        stick.style.background = colors[i % colors.length];
        root.appendChild(stick);
      }
    }

    // Create the sticks
    setupSticks(c1);
    setupSticks(c2);

    // Start the animation
    animate('#c1 .stick');
    animate('#c2 .stick');
  }

  function setupFpsMeters() {
    var heading = document.getElementById('heading');
    var meter = new FPSMeter(heading, {
      heat: true,
      theme: 'colorful',
      graph: true
    });

    function tick() {
      meter.tick();
      window.requestAnimationFrame(tick);
    }
    window.requestAnimationFrame(tick);
  }

  function animate(selector) {
    // Animate all elements matching the selector
    snabbt(document.querySelectorAll(selector), {
      fromPosition: function(i, count) {
        return [0, -(count / 2) * 5 + 5 * i, i * 1];
      },
      position: function(i) { return [radius, 0, i * 1]; },
      duration: 1000,
      easing: 'ease'
    }).snabbt({
      rotationPost: function(i, count) {
        return [0, 0, i / count * 2 * Math.PI];
      },
      duration: 1000,
      easing: 'ease'
    }).snabbt({
      fromPosition: function(i, count) {
        return [
          radius * Math.cos(i / count * 2 * Math.PI),
          -radius * Math.sin(i / count * 2 * Math.PI),
          0
        ];
      },
      position: function(i, count) {
        return [
          radius / 2 * Math.cos(i / count * 2 * Math.PI),
          -(radius / 2) * Math.sin(i / count * 2 * Math.PI),
          0
        ];
      },
      fromRotation: function(i, count) {
        return [0, 0, i / count * 2 * Math.PI - 2 * Math.PI];
      },
      rotation: function(i, count) {
        return [0, 0, i / count * 2 * Math.PI - 2 * Math.PI];
      },
      fromRotationPost: [-2 * Math.PI, 0, 0],
      rotationPost: [0, 0, 0],
      delay: function(i) { return i * 10; },
      duration: 1000
    }).snabbt({
      fromPosition: [radius / 2, 0, 0],
      position: function(i, count) {
        return [0, -(count / 2) * 5 + 5 * i, 0];
      },
      fromRotation: [0, 0, 0],
      rotation: [0, 0, 0],
      fromRotationPost: function(i, count) {
        return [0, 0, i / count * 2 * Math.PI];
      },
      rotationPost: [0, 0, 0],
      easing: 'ease',
      delay: function(i, count) {
        return count * 10 + i * 10;
      },
      duration: 1000,
      complete: function(i, count) {
        if (i === count - 1) {
          animate(selector);
        }
      }
    });
  }
  init();

})(window, snabbt);
