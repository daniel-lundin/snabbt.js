(function() {

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
      deaccelaration: 0.95,
    });
  };


  $(function() {
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
  });

}());
