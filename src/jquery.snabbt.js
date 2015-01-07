if(window.jQuery) {
  (function ( $ ) {
    $.fn.snabbt = function(arg1, arg2) {
      return snabbtjs.snabbt(this.get(), arg1, arg2);
    };
  }( jQuery ));
}
