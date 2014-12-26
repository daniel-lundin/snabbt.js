/**
 * House of cards
 */

var CARD_HEIGHT = 100;
var CARD_WIDTH = 60;
var CARD_COUNT = 40;

var WIDTH = 800;
var HEIGHT = 600;
var BOTTOM = 400;

var TILT = Math.PI/8;
var PYTH_ANGLE = Math.PI/2 - TILT;
var TILTED_CARD_HEIGHT = Math.sin(PYTH_ANGLE) * CARD_HEIGHT;
var TILTED_CARD_WIDTH = Math.cos(PYTH_ANGLE) * CARD_HEIGHT;
var PYRAMID_WIDTH = TILTED_CARD_WIDTH * 2;

var COLORS = randomColor({count: 40});

var PILE = 1;
var HOUSE = 2;
var WALL = 3;
var current_mode = PILE;

var formation_builders = {};
formation_builders[PILE] = pile_positions;
formation_builders[HOUSE] = centered_house_positions;
formation_builders[WALL] = wall_positions;

function create_card(container, index) {
  var card = document.createElement('div');
  card.className = 'card';
  card.style.height = CARD_HEIGHT + 'px';
  card.style.width = CARD_WIDTH + 'px';

  var front = document.createElement('div');
  front.className = 'front';
  front.style.background = COLORS[index % COLORS.length];

  var back = document.createElement('div');
  back.className = 'back';
  back.style.background = COLORS[index % COLORS.length];

  card.appendChild(front);
  card.appendChild(back);
  container.appendChild(card);
  return card;
}

// Deck
var Deck = (function() {
  this.cards = [];
  this.card_index = [];

  for(var i=0;i<CARD_COUNT;++i) {
    var container = document.getElementById('surface');
    this.cards.push(create_card(container, i));
  }

  this.next_card = function() {
    if(this.card_index > 51)
      return;
    return this.cards[this.card_index++];
  };

  this.card_at = function(index) {
    return this.cards[index];
  };

  this.reset = function() {
    this.card_index = 0;
  };
  return this;
})();

function build_formation(positions) {
  Deck.reset();
  for(i=0;i<positions.length;++i) {
    snabbt(Deck.next_card(), {
      from_position: positions[i].from_position,
      from_rotation: positions[i].from_rotation,
      position: positions[i].position,
      rotation: positions[i].rotation,
      easing: 'cos',
      //perspective: 2000,
      delay: i * 50
    });
  }
}

function set_mode(mode) {
  if(mode == current_mode) {
    return;
  }

  positions = formation_builders[mode]();
  from_positions = formation_builders[current_mode]();

  for(var i=0;i<positions.length;++i) {
    positions[i].from_position = from_positions[i].position;
    positions[i].from_rotation = from_positions[i].rotation;
  }

  build_formation(positions);
  current_mode = mode;
}

function rotate_container() {
  var container = document.getElementById('surface');
  snabbt(container, {
    rotation: [0, 2*Math.PI, 0],
    duration: 10000,
    loop: Infinity
  });
}

function pile_positions() {
  var positions = [];
  Deck.reset();
  var i=0;
  var card=Deck.next_card();
  var center = (WIDTH - CARD_WIDTH)/2;
  while(card) {
    positions.push({
      position: [center, BOTTOM - i*0.5, 300],
      rotation: [Math.PI/2, 0, 0],
    });
    ++i;
    card = Deck.next_card();
  }
  return positions;
}

function house_positions(floors, x, y, z) {
  Deck.reset();
  var positions = [];
  var i;
  for(i=0;i<floors;++i) {
    positions = positions.concat(house_row_positions(floors - i, x + i * TILTED_CARD_WIDTH, y - i * TILTED_CARD_HEIGHT, z));
  }

  return positions;
}

function house_row_positions(count, x, y, z) {
  var positions = [];
  var i;
  // Tilted cards
  for(i=0;i<count;++i) {
    card_positions = pyramid_postions(x + i*PYRAMID_WIDTH, y, z);
    positions.push({
      position: card_positions[0].position,
      rotation: card_positions[0].rotation,
    });
    positions.push({
      position: card_positions[1].position,
      rotation: card_positions[1].rotation,
    });
  }
  // Bridge cards
  for(i=0;i<count-1;++i) {
    positions.push({
      position: [x + i*PYRAMID_WIDTH + TILTED_CARD_WIDTH, y - TILTED_CARD_HEIGHT/2, z],
      rotation: [Math.PI/2, Math.PI/2, 0],
    });
  }
  return positions;
}

function pyramid_postions(x, y, z) {
  var spacing = TILTED_CARD_WIDTH / 2;

  return [{
    position: [x - spacing, y, z],
    rotation: [-TILT, Math.PI/2, 0],
  }, {
    position: [x + spacing, y, z],
    rotation: [TILT, Math.PI/2, 0],
  }];
}

function wall_positions() {
  var positions = [];
  var start_x = (WIDTH - 10 * CARD_WIDTH) / 2;
  var start_y = (HEIGHT - 4 * CARD_HEIGHT) / 2;
  for(var i=0;i<CARD_COUNT;++i) {
    var x = (i % 10) * CARD_WIDTH + start_x;
    var y = (Math.floor(i/10)) * CARD_HEIGHT + start_y;
    positions.push({
      position: [x, y, 0],
      rotation: [0, 0, 0]
    });
  }
  return positions;
}

function build_wall() {
  set_mode(WALL);
}

function build_house() {
  set_mode(HOUSE);
}

function build_pile() {
  set_mode(PILE);
}

function centered_house_positions() {
  // TODO: Actually center
  return house_positions(5, 200, BOTTOM, -300);
}

function init() {
  Deck.reset();
  build_wall();
  rotate_container();

  // Event handlers
  var buttons = {
    "pile_button": PILE,
    "house_button": HOUSE,
    "wall_button": WALL
  };

  var click_handler = function(key) {
    document.getElementById('pile_button').className = '';
    document.getElementById('house_button').className = '';
    document.getElementById('wall_button').className = '';
    document.getElementById(key).className = 'button-primary';
    set_mode(buttons[key]);
  };

  for(var key in buttons) {
    document.getElementById(key).addEventListener('click', click_handler.bind(undefined, key));
  }
}
