$(function() {



  var title = $("h1").text();
  $("h1 span").each(function(idx, element) {
    var x = 20;
    var z = title.length/2 * x - Math.abs((title.length/2 - idx) * x);
    snabbt(element, {
      from_rotation: [0, 0, -8*Math.PI],
      //perspective: 70,
      delay: 1000 + idx * 100,
      duration: 1000,
      easing: 'cos',
      callback: function() {
        if(idx == title.length - 1) {
          $("h1").snabbt({
            rotation: [-Math.PI/4, 0, 0],
            perspective: 100,
            easing: 'sqrt',
            delay: 400,
            duration: 1000
          }).then({
            easing: 'spring',
            perspective: 100,
            spring_constant: 0.1,
            spring_deaccelaration: 0.99,
            spring_mass: 2,
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
      easing: 'cos',
    }).then({
      position: [2*w, 0, 0],
      skew: [0, 0],
      easing: 'sqrt',
      duration: 200,
    }).then({
      offset: [w/2, 0, 0],
      rotation: [0, Math.PI, 0],
      from_position: [2*w - w/2, 0, 0],
      position: [2*w - w/2, 0, 0],
      perspective: 500,
      easing: 'cos',
      delay: 200,
    }).then({
      offset: [-w/2, 0, 0],
      from_rotation: [0, -Math.PI, 0],
      from_position: [w - w/2, 0, 0],
      position: [w - w/2, 0, 0],
      perspective: 500,
      easing: 'cos',
    });
  });

  // Usage example
  document.getElementById('usage-example-execute').onclick = function() {
    snabbt(document.getElementById('usage-example-execute'), {
        position: [100, 0, 0],
        rotation: [0, 0, Math.PI],
        duration: 1000,
        delay: 100,
        easing: 'cos'
    });
  };

  // Chaining example
  document.getElementById('chaining-example-execute').onclick = function() {
    snabbt(document.getElementById('chaining-example-execute'), {
      position: [100, 0, 0],
      easing: 'cos'
    }).then({
      from_rotation: [0, 0, -2*Math.PI],
      easing: 'spring',
      spring_constant: 0.2,
      spring_deaccelaration: 0.95,
    });
  };


  // Value feed example
  $("#value-feed-example").on('click', function() {
    $("#value-feed-example").snabbt({
      value_feeder: function(i) {
        var y = 50*Math.sin(i*4*Math.PI);
        var x = Math.sin(i*Math.PI);
        return snabbtjs.mult(snabbtjs.scale(1+x, 1+x), snabbtjs.trans(x*400, y, 0));
      },
      duration: 1000,
    });
  });

  // Attention example
  $("#attention-example-1").on('click', function() {
    $("#attention-example-1").snabbt("attention", {
      rotation: [0, 0, Math.PI/2],
      spring_constant: 1.9,
      spring_deacceleration: 0.9,
    });
  });

  // Attention example
  $("#attention-example-2").on('click', function() {
    $("#attention-example-2").snabbt("attention", {
      position: [50, 0, 0],
      spring_constant: 2.4,
      spring_deacceleration: 0.9,
    });
  });




  // Scroll spy
  var navtop = $("#navbar").offset().top;
  var $docked_navbar = $("#docked-navbar");
  var $window = $(window);
  $(window).on('scroll', function(event) {
    if($window.scrollTop() > navtop) {
      if($docked_navbar.hasClass('hidden'))
        $("#docked-navbar").removeClass("hidden");
    } else {
      if(!$docked_navbar.hasClass('hidden'))
        $("#docked-navbar").addClass("hidden");
    }
  });

}());
