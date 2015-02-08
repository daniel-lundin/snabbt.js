STICK_COUNT = 100;

function init() {
  setupFpsMeters();
  var colors = randomColor({
    count: 7,
    luminosity: 'dark',
    format: 'rgb'
  });

  // Layout
  var c1 = document.getElementById('c1');
  c1.style.top = window.innerHeight/2 + 'px';
  c1.style.left = (3*(window.innerWidth/4) - 25) + 'px';
  var c2 = document.getElementById('c2');
  c2.style.top = window.innerHeight/2 + 'px';
  c2.style.left = ((window.innerWidth/4) - 25) + 'px';

  function setupSticks(root) {
    for(var i=0;i<STICK_COUNT;++i) {
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
      return [0, -(count/2) * 5 + 5*i, 0];
    },
    position: [200, 0, 0],
    duration: 1000,
    easing: 'ease'
  }).then({
    rotationPost: function(i, count) {
      return [0, 0, (i/count)*2*Math.PI];
    },
    duration: 1000,
    easing: 'ease'
  }).then({
    fromPosition: function(i, count) {
      return [
        200*Math.cos((i/count)*2*Math.PI),
        -200*Math.sin((i/count)*2*Math.PI),
        0
      ];
    },
    position: function(i, count) {
      return [
        100*Math.cos((i/count)*2*Math.PI),
        -100*Math.sin((i/count)*2*Math.PI),
        0
      ];
    },
    fromRotation: function(i, count) {
      return [0, 0, (i/count)*2*Math.PI - 2*Math.PI];
    },
    rotation: function(i, count) {
      return [0, 0, (i/count)*2*Math.PI - 2*Math.PI];
    },
    fromRotationPost: [-2*Math.PI, 0, 0],
    rotationPost: [0, 0, 0],
    delay: function(i) { return i*10; },
    duration: 1000,
  }).then({
    fromPosition: [100, 0, 0],
    position: function(i, count) {
      return [0, -(count/2) * 5 + 5*i, 0];
    },
    fromRotation: [0, 0, 0],
    fromRotationPost: function(i, count) {
      return [0, 0, (i/count)*2*Math.PI];
    },
    rotationPost: [0, 0, 0],
    easing: 'ease',
    delay: function(i, count) {
      return count*10 + i*10;
    },
    duration: 1000,
    callback: function(i, count) {
      if(i === count - 1) {
        animate(selector);
      }
    }
  });
}

