(function ( $ ) {
  $.fn.snabbt = function(options) {
    return snabbt(this.toArray(), options);
    return this.each(function(index) {
      console.log(index);
      snabbt(this, options);
    });
  };
}( jQuery ));
