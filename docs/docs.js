$(function() {

  var title = $("h1").text();
  var titleHeight = $("h1").height();

  // Title animation
  $("h1 span").snabbt({
    fromRotation: [0, 0, -8*Math.PI],
    delay: function(i) {
      return 1000 + i * 100;
    },
    duration: 1000,
    easing: 'ease',
    complete: function(i, length) {
      if(i === length - 1) {
        $("h1").snabbt({
          transformOrigin: [0, 100, 0],
          rotation: [-Math.PI/4, 0, 0],
          perspective: 300,
          easing: 'linear',
          delay: 400,
          duration: 1000
        }).snabbt({
          rotation: [0, 0, 0],
          transformOrigin: [0, 100, 0],
          easing: 'spring',
          perspective: 300,
          springConstant: 0.2,
          springDeceleration: 0.90,
          springMass: 4,
        });
      }
    }
  });

  // Title easter egg
  $("h1").on('click', function() {
    var width = $("h1").width();
    $("h1").snabbt({
      fromPosition: [0, 0, 0],
      skew: [0, 0.9],
      easing: 'ease',
    }).snabbt({
      position: [2*width, 0, 0],
      skew: [0, 0],
      easing: 'easeIn',
      duration: 200,
    }).snabbt({
      transformOrigin: [-width/2, 0, 0],
      rotation: [0, -Math.PI, 0],
      fromPosition: [2*width, 0, 0],
      position: [2*width, 0, 0],
      perspective: 500,
      easing: 'ease',
      delay: 200,
    }).snabbt({
      transformOrigin: [width/2, 0, 0],
      rotation: [0, 0, 0],
      fromPosition: [0, 0, 0],
      position: [0, 0, 0],
      perspective: 500,
      easing: 'ease',
    });
  });

  // Usage example
  document.getElementById('usage-example-execute').onclick = function() {
    snabbt(document.getElementById('usage-example-execute'), {
      position: [100, 0, 0],
      rotation: [0, 0, Math.PI],
      easing: 'ease'
    });
  };

  // Chaining example
  document.getElementById('chaining-example-execute').onclick = function() {
    snabbt(document.getElementById('chaining-example-execute'), {
      position: [100, 0, 0],
      easing: 'ease'
    }).snabbt({
      position: [0, 0, 0],
      fromRotation: [0, 0, -2*Math.PI],
      rotation: [0, 0, 0],
      easing: 'spring',
      springConstant: 0.2,
      springDeceleration: 0.90,
      springMass: 10,
    });
  };

  // Easings
  var easingDemos = document.querySelectorAll('.easing-demo');
  for(var i=0;i<easingDemos.length;++i) {
    var container = easingDemos[i];
    var easingName = container.attributes['data-easing-name'];
    var element = container.children[0];
    container.onclick = function(container, element, easingName) {
      var containerWidth = container.offsetWidth;
      var elementWidth = element.offsetWidth;
      snabbt(element, {
        fromPosition: [0, 0, 0],
        position: [containerWidth - elementWidth, 0, 0],
        easing: easingName.value,
        duration: 500
      });
    }.bind(undefined, container, element, easingName);
  }

  // Spring easings
  $("#spring-example").on('click', function() {
    $("#spring-example").snabbt({
      position: [100, 0, 0],
      fromRotation: [0, 0, 0],
      rotation: [0, 0, 2*Math.PI],
      easing: 'spring',
      springConstant: 0.3,
      springDeceleration: 0.8,
    }).snabbt({
      position: [0, 0, 0],
      easing: 'spring',
      springConstant: 0.3,
      springDeceleration: 0.8,
    });
  });

  // Custom easing
  $("#custom-easer").on('click', function() {
    $("#custom-easer").snabbt({
      position: [200, 0, 0],
      easing: function(value) {
        return value + 0.3 * Math.sin(2*Math.PI * value);
      }
    }).snabbt({
      position: [0, 0, 0],
      easing: 'easeOut'
    });
  });

  // Value feed example
  $("#value-feed-example").on('click', function() {
    $("#value-feed-example").snabbt({
      valueFeeder: function(i, matrix) {
        var x = Math.sin(i*Math.PI);
        return matrix.rotateZ(Math.sin(6*i*Math.PI)).translate(x*200, 0, 0);
      },
      duration: 1000,
    });
  });

  // Transform origin example
  $("#transform-origin-example").on('click', function() {
    var elementWidth = $("#transform-origin-example").outerWidth();
    $("#transform-origin-example").snabbt({
      fromRotation: [0, 0, 0],
      rotation: [0, 2*Math.PI, 0],
      transformOrigin: [elementWidth/2, 0, 0],
      perspective: 400,
    });
  });

  // Transform origin example
  $("#transform-origin-example-2").on('click', function() {
    var elementWidth = $("#transform-origin-example-2").outerWidth();
    $("#transform-origin-example-2").snabbt({
      rotation: [0, Math.PI, 0],
      transformOrigin: [elementWidth/2, 0, 0],
      perspective: 400,
      duration: 300,
      easing: 'ease'
    }).snabbt({
      fromPosition: [2*elementWidth, 0, 0],
      position: [2*elementWidth, 0, 0],
      fromRotation: [0, -Math.PI, 0],
      rotation: [0, 0, 0],
      transformOrigin: [-elementWidth/2, 0, 0],
      perspective: 400,
      duration: 300,
      easing: 'ease'
    }).snabbt({
      fromRotation: [0, 0, 0],
      fromPosition: [2*elementWidth, 0, 0],
      position: [0, 0, 0],
      duration: 300,
      easing: 'ease'
    });
  });



  // Attention example
  $("#attention-example-1").on('click', function() {
    $("#attention-example-1").snabbt("attention", {
      rotation: [0, 0, Math.PI/2],
      springConstant: 1.9,
      springDeceleration: 0.9,
    });
  });

  // Attention example
  $("#attention-example-2").on('click', function() {
    $("#attention-example-2").snabbt("attention", {
      position: [50, 0, 0],
      springConstant: 2.4,
      springDeceleration: 0.9,
    });
  });

  // Multi element animation
  $("#multi-element-example").on('click', function() {
    $(".multi-example").snabbt({
      fromRotation: [0, 0, 0],
      rotation: function(i, total) {
        return [0, 0, (i/(total - 1)) * (Math.PI/2)];
      },
      delay: function(i) {
        return i * 50;
      },
      easing: 'spring',
    }).snabbt({
      rotation: [0, 0, 0],
      delay: function(i, total) {
        return (total - i - 1) * 50;
      },
      easing: 'ease',
    });
  });


  // Manual example
  (function() {
    var flipper = document.getElementById('flipper');
    var flipperDrag = document.getElementById('flipper-drag');
    var flipperBackground = document.getElementById('flipper-background');

    var dragInProgress = false;

    function dragRightAnimations() {
      var animations = [];
      animations.push(snabbt(flipper, {
        fromRotation: [0, 0, 0],
        rotation: [0, -Math.PI, 0],
        transformOrigin: [50, 0, 0],
        manual: true,
        easing: 'ease',
        duration: 1000
      }));
      animations.push(snabbt(flipperBackground, {
        fromScale: [0.0, 0.0],
        scale: [1.0, 1.0],
        fromRotation: [0, 0, 2*Math.PI],
        rotation: [0, 0, 0],
        manual: true,
        easing: 'ease',
        duration: 1000
      }));
      return animations;
    }

    function dragLeftAnimations() {
      var animations = [];
      animations.push(snabbt(flipper, {
        fromRotation: [0, -Math.PI, 0],
        rotation: [0, 0, 0],
        transformOrigin: [50, 0, 0],
        manual: true,
        easing: 'ease',
        duration: 1000
      }));
      animations.push(snabbt(flipperBackground, {
        scale: [0.0, 0.0],
        fromRotation: [0, 0, 0],
        rotation: [0, 0, 2*Math.PI],
        manual: true,
        easing: 'ease',
        duration: 1000
      }));
      return animations;
    }

    // Execute callback after `number` calls
    var debouncedCallback = function(callback, number) {
      var n = number;
      return function() {
        n--;
        if(n === 0) {
          callback();
        }
      };
    };


    var hammer = new Hammer(flipperDrag);
    var opened = -1;
    var animations = [];
    hammer.on('pan', function(event) {
      if(!dragInProgress) {
        if(opened === -1) {
          animations = dragRightAnimations();
        } else {
          animations = dragLeftAnimations();
        }
        dragInProgress = true;
      }

      var delta = Math.min(1, Math.max(0, (-opened * event.deltaX)/200));
      if(animations.length) {
        animations.forEach(function(animation) {
          animation.setValue(delta);
        });
      }


      if(event.isFinal) {
        if(animations) {
          if(delta > 0.5) {
            var finishCallback = debouncedCallback(function() {
              dragInProgress = false;
              opened *= -1;
            }, animations.length);

            animations.forEach(function(animation) {
              animation.finish(finishCallback);
            });
          } else {
            var rollbackCallback = debouncedCallback(function() {
              dragInProgress = false;
            }, animations.length);

            animations.forEach(function(animation) {
              animation.rollback(rollbackCallback);
            });
          }
          animations = undefined;
        }
      }
    });
  })();

  // Scroll spy
  var navtop = $("#navbar").offset().top;
  var $dockedNavbar = $("#docked-navbar");
  var $window = $(window);
  $(window).on('scroll', function(event) {
    if($window.scrollTop() > navtop) {
      if($dockedNavbar.hasClass('hidden'))
        $("#docked-navbar").removeClass("hidden");
    } else {
      if(!$dockedNavbar.hasClass('hidden'))
        $("#docked-navbar").addClass("hidden");
    }
  });

  FastClick.attach(document.body);

}());
