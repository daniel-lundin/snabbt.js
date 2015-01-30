$(function() {

  var title = $("h1").text();
  var titleHeight = $("h1").height();

  $("h1 span").each(function(idx, element) {
    var x = 20;
    var z = title.length/2 * x - Math.abs((title.length/2 - idx) * x);
    snabbt(element, {
      fromRotation: [0, 0, -8*Math.PI],
      delay: 1000 + idx * 100,
      duration: 1000,
      easing: 'ease',
      callback: function() {
        if(idx == title.length - 1) {
          $("h1").snabbt({
            transformOrigin: [0, 100, 0],
            rotation: [-Math.PI/4, 0, 0],
            perspective: 300,
            easing: 'linear',
            delay: 400,
            duration: 1000
          }).then({
            transformOrigin: [0, 100, 0],
            easing: 'spring',
            perspective: 300,
            springConstant: 0.1,
            springDecelaration: 0.99,
            springMass: 2,
          });
        }
      }
    });

  });

  // Title easter egg
  $("h1").on('click', function() {
    var width = $("h1").width();
    $("h1").snabbt({
      skew: [0, 0.9],
      easing: 'ease',
    }).then({
      position: [2*width, 0, 0],
      skew: [0, 0],
      easing: 'easeIn',
      duration: 200,
    }).then({
      transformOrigin: [-width/2, 0, 0],
      rotation: [0, -Math.PI, 0],
      fromPosition: [2*width, 0, 0],
      position: [2*width, 0, 0],
      perspective: 500,
      easing: 'ease',
      delay: 200,
    }).then({
      transformOrigin: [width/2, 0, 0],
      fromRotation: [0, -Math.PI, 0],
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
    }).then({
      fromRotation: [0, 0, -2*Math.PI],
      easing: 'spring',
      springConstant: 0.2,
      springDecelaration: 0.95,
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
      snabbt(element, 'stop');
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
      rotation: [0, 0, 2*Math.PI],
      easing: 'spring',
      springConstant: 0.3,
      springDeceleration: 0.8,
    }).then({
      fromRotation: [0, 0, 0],
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
        return Math.sin(Math.PI * value);
      }
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
    }).then({
      fromPosition: [2*elementWidth, 0, 0],
      position: [2*elementWidth, 0, 0],
      fromRotation: [0, -Math.PI, 0],
      transformOrigin: [-elementWidth/2, 0, 0],
      perspective: 400,
      duration: 300,
      easing: 'ease'
    }).then({
      fromRotation: [0, 0, 0],
      fromPosition: [2*elementWidth, 0, 0],
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


  // Manual example
  (function() {
    var flipper = document.getElementById('flipper');

    var dragInProgress = false;

    function dragRightAnimation() {
      return snabbt(flipper, {
        fromRotation: [0, 0, 0],
        rotation: [0, -Math.PI, 0],
        transformOrigin: [50, 0, 0],
        manual: true,
        easing: 'ease',
        duration: 400
      });
    }

    function dragLeftAnimation() {
      return snabbt(flipper, {
        fromRotation: [0, -Math.PI, 0],
        rotation: [0, 0, 0],
        transformOrigin: [50, 0, 0],
        manual: true,
        easing: 'ease',
        duration: 400
      });
    }


    var hammer = new Hammer(flipper);
    var opened = false;
    hammer.on('pan', function(event) {
      if(!dragInProgress) {
        if(!opened) {
          animation = dragRightAnimation();
        } else {
          animation = dragLeftAnimation();
        }
        dragInProgress = true;
      }

      var delta = Math.abs(event.deltaX/200);
      if(animation) {
        animation.setValue(delta);
      }


      if(event.isFinal) {
        if(animation) {
          var callback = function() {
            dragInProgress = false;
          };
          if(delta > 0.5) {
            animation.finish(function() {
              dragInProgress = false;
              opened = !opened;
            });
          } else {
            animation.rollback(function() {
              dragInProgress = false;
            });
          }
          animation = undefined;
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
