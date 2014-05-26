var animation = {
  start: function() {
    this.letters = document.getElementsByClassName('letter');
    this.finished_letters_animation = 0;

    // Center container
    var container = document.getElementById('container');
    container.style.left = window.innerWidth/2 + 'px';
    container.style.top = '200px';
    // Start letter animation
    this.letter_animation();
  },

  letter_animation: function() {
    var letters_width = this.letters.length*70 + (this.letters.length-1) * 10;
    var letter_start = -letters_width/2;
    var letter_width = 80;
    var self = this;

    for(var i=0;i<this.letters.length;++i) {
      snabbt(this.letters[i], {
        pos: [letters_width/2 - letter_width*i - letter_width + 10, 200, 0],
        from_rot: [0, 0, -2*Math.PI],
        easing: 'cos',
        delay: 500 + i * 200,
        duration: 200,
      }).then({
        pos: [letter_start + letter_width*i, -100, 0],
        rot_post: [Math.PI, 0, 0],
        easing: 'cos',
        delay: (this.letters.length - 1)*200,
        duration: 500
      }).then({
        pos: [letter_start + letter_width*i, 0, 0],
        rot_post: [2*Math.PI, 0, 0],
        callback: function() { 
          self.letters_animated();
        },
        delay: 1400,
        duration: 500
      });
    }
  },

  letters_animated: function() {
    var self = this;
    this.finished_letters_animation += 1;
    if(this.finished_letters_animation != this.letters.length) {
      return;
    }
    var banner = document.getElementById('banner');
    snabbt(banner, {
      from_pos: [-300, 100, -10],
      pos: [-300, 100, -10],
      from_rot_post: [0.02 + Math.PI/2, 0, 0],
      rot_post: [0, 0, 0],
      duration: 1000,
      easing: 'sinc_wobbler',
      callback: function() { self.ribbon_twist() },
    });
  },


  ribbon_twist:  function() {
    var ribbon = document.getElementById('ribbon');
    var w = window.innerWidth;
    snabbt(ribbon, {
      from_pos: [-w, 0, 0],
      pos: [-w, 0, 0],
      callback: function() { ribbon.style.visibility = 'visible'; },
      duration: 1,
    }).then({
      from_pos: [-w, 0, 0],
      pos: [0, 0, 0],
      rot: [2*Math.PI, 0, 0],
      easing: 'cos'
    });
  },
  //flip_flip: function() {
  //  var c = document.getElementById('container');

  //  var e = document.getElementById('again');
  //  snabbt(e, {
  //    from_pos: [200,0,0],
  //    pos: [200,0,0],
  //    offset: [-800, 0,0],
  //    start_rot_post: [0, -Math.PI, 0],
  //    end_rot_post: [0, 0, 0],
  //    duration: 500
  //  }).then({
  //    from_pos: [-200, 0,0],
  //    pos: [-200, 0,0],
  //    offset: [-400, 0,0],
  //    start_rot_post: [0, 0, 0],
  //    end_rot_post: [0, Math.PI, 0],
  //    duration: 500
  //  }).then({
  //    from_pos: [200, 0,0],
  //    pos: [200, 0,0],
  //    offset: [0, 0, 0],
  //    start_rot_post: [0, -Math.PI, 0],
  //    end_rot_post: [0, 0, 0],
  //    duration: 500
  //  });
  //},
};

function init_animation() {
  animation.start();
}
