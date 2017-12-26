import ROT from 'rot-js';
import Player from './player';
import Map from './map';
import FOV from './fov';
import Movement from './movement';

function setup() {
  const displaySettings = {
    width: 21,
    height: 21,
    fontSize: 14,
    fontFamily: 'monospace',
    spacing: 1,
    layout: 'rect',
    fg: 'white',
    forceSquareRatio: true
  };
  const container = document.getElementById("main");
  container.innerHTML = '';
  const display = new ROT.Display(displaySettings);
  container.appendChild(display.getContainer());
  return display;
}

const display = setup();
const player = new Player({ x: 1, y: 1 });
const map = new Map({ width: 21, height: 21 });
const movement = new Movement({player, map});
const fov = new FOV({player, map});

window.Game = {
  display, player, map, movement, fov
};

function handleInput(constant) {
  switch (constant) {
    case ROT.VK_LEFT:
      movement.movePlayerBy(-1, 0);
      break;
    case ROT.VK_RIGHT:
      movement.movePlayerBy(1, 0);
      break;
    case ROT.VK_DOWN:
      movement.movePlayerBy(0, 1);
      break;
    case ROT.VK_UP:
      movement.movePlayerBy(0, -1);
      break;
    default:
      break;
  }
  update(display)
}

function update(display) {
  display.clear();
  map.drawExploredMap(display);
  fov.draw(display);
}

document.addEventListener("keyup", function (e) {
  var code = e.keyCode;
  

  let vk = "?";
  for (let name in ROT) {
    if (ROT[name] == code && name.indexOf("VK_") == 0) { vk = name; }
  }
  
  handleInput(code);
});

update(display);
