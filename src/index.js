import ROT from 'rot-js';
import ECS from 'mikkpr-ecs';

import RenderSystem from './systems/render';
import PositionSystem from './systems/position';
import MovementSystem from './systems/movement';
import LightSystem from './systems/light';

import Player from './entities/player';
import {Lamp, FurnitureItem} from './entities/furniture';

import {createMap, setupDisplay} from './utils';

// set up some constants
const DISPLAY_WIDTH = 21;
const DISPLAY_HEIGHT = 21;

// initialize our ECS system
const ecs = new ECS({systemsFirst: true});

// create display
const display = setupDisplay(DISPLAY_WIDTH, DISPLAY_HEIGHT);

// create initial map
const map = createMap(DISPLAY_WIDTH, DISPLAY_HEIGHT);
const light = new Lamp({
  position: {x: 15, y: 15, z: 1},
  glyph: {char: 'O', fg: [128, 128, 0], bg: [0, 0, 0]},
  light: {active: true, color: [255, 255, 0], radius: 7}
});
const pillar1 = new FurnitureItem({
  position: {x: 15, y: 5, z: 1},
  glyph: {char: 'I', fg: [255, 255, 255], bg: 'black'},
  properties: ['BLOCKS_LIGHT']
});

const pillar2 = new FurnitureItem({
  position: {x: 17, y: 5, z: 1},
  glyph: {char: 'X', fg: [255, 255, 255], bg: 'black'},
  properties: ['BLOCKS_LIGHT']
});

ecs.addEntity(light);
ecs.addEntity(pillar1);
ecs.addEntity(pillar2);

map.addItem(light);
map.addItem(pillar1);
map.addItem(pillar2);

map.forEach(tile => ecs.addEntity(tile));

// create player
const player = new Player(5, 5);
ecs.addEntity(player);

// initialize systems
const renderer = new RenderSystem(display);

ecs.addSystem(new PositionSystem(renderer));
ecs.addSystem(new MovementSystem(renderer));
ecs.addSystem(new LightSystem(renderer));
ecs.addSystem(renderer);

window.Game = {
  display,
  map,
  player,
  renderer,
  ecs
};

function update() {
  display.clear();

  renderer.clear();

  ecs.update();
}

document.addEventListener('keyup', e => {
  var code = e.keyCode;

  player.handleInput(code);

  update();
});

update();
