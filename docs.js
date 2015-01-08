$(function() {

  var title = $("h1").text();
  var titleHeight = $("h1").height();

  $("h1 span").each(function(idx, element) {
    var x = 20;
    var z = title.length/2 * x - Math.abs((title.length/2 - idx) * x);
    snabbt(element, {
      fromRotation: [0, 0, -8*Math.PI],
      //perspective: 70,
      delay: 1000 + idx * 100,
      duration: 1000,
      easing: 'ease',
      callback: function() {
        if(idx == title.length - 1) {
          $("h1").snabbt({
            offset: [0, -titleHeight, 0],
            fromPosition: [0, titleHeight, 0],
            position: [0, titleHeight, 0],
            rotation: [-Math.PI/4, 0, 0],
            perspective: 100,
            easing: 'linear',
            delay: 400,
            duration: 1000
          }).then({
            offset: [0, -titleHeight, 0],
            fromPosition: [0, titleHeight, 0],
            position: [0, titleHeight, 0],
            easing: 'spring',
            perspective: 100,
            springConstant: 0.1,
            springDeaccelaration: 0.99,
            springMass: 2,
          });
        }
      }
    });

  });

  // Title easter egg
  $("h1").on('click', function() {
    var w = $("h1").width();
    $("h1").snabbt({
      skew: [0, 0.9],
      easing: 'ease',
    }).then({
      position: [2*w, 0, 0],
      skew: [0, 0],
      easing: 'easeIn',
      duration: 200,
    }).then({
      offset: [w/2, 0, 0],
      rotation: [0, Math.PI, 0],
      fromPosition: [2*w - w/2, 0, 0],
      position: [2*w - w/2, 0, 0],
      perspective: 500,
      easing: 'ease',
      delay: 200,
    }).then({
      offset: [-w/2, 0, 0],
      fromRotation: [0, -Math.PI, 0],
      fromPosition: [w - w/2, 0, 0],
      position: [w - w/2, 0, 0],
      perspective: 500,
      easing: 'ease',
    });
  });

  // Usage example
  document.getElementById('usage-example-execute').onclick = function() {
    snabbt(document.getElementById('usage-example-execute'), {
      position: [100, 0, 0],
      rotation: [0, 0, Math.PI],
      duration: 1000,
      delay: 100,
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
      springDeaccelaration: 0.95,
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
      springDeacceleration: 0.8,
    }).then({
      fromRotation: [0, 0, 0],
      easing: 'spring',
      springConstant: 0.3,
      springDeacceleration: 0.8,
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

  // Attention example
  $("#attention-example-1").on('click', function() {
    $("#attention-example-1").snabbt("attention", {
      rotation: [0, 0, Math.PI/2],
      springConstant: 1.9,
      springDeacceleration: 0.9,
    });
  });

  // Attention example
  $("#attention-example-2").on('click', function() {
    $("#attention-example-2").snabbt("attention", {
      position: [50, 0, 0],
      springConstant: 2.4,
      springDeacceleration: 0.9,
    });
  });

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
