import "../sass/style.sass";
import { Client } from './Client.js';
const Player = require('@shared/Player');

// == LOGIN SCREEN ==
// Update the player color each time it changes
document.querySelectorAll('.color').forEach(el => {
  el.addEventListener('change', () => {
    document.querySelector('#login_button').style.backgroundColor = el.value;
    document.querySelector('#colors').dataset.color = el.value;
  })
});

// Start the game when ENTER is pressed
document.querySelector('#login_box').addEventListener('keypress', event => {
  if (event.keyCode == 13)
    start_game();
})

// Start the game when join btn is clicked
document.querySelector('#login_button').addEventListener('click', start_game)


// == I/O HANDLING ==
function pointerHandler(event) {
  const relative_x = parseInt(event.clientX - client.player_screen_x);
  const relative_y = parseInt(client.player_screen_y - event.clientY);
  client.player.angle = Math.acos(relative_x/Math.sqrt(Math.pow(relative_x, 2) + Math.pow(relative_y, 2))) * 180/Math.PI;
  if (relative_y < 0)
    client.player.angle = 360 - client.player.angle;
}

function mousedownHandler() {
  client.mouse[1] = true
}

function mouseupHandler() {
  client.mouse[1] = false
}

function keyDownHandler(event) {
  switch(event.which || event.keyCode) {
  case 87: // W
  case 65: // A
  case 83: // S
  case 68: // D
  case 32: // SPACE
    client.kb[event.which || event.keyCode] = true;
  }
}

function keyUpHandler(event) {
  switch(event.which || event.keyCode) {
  case 87: // W
  case 65: // A
  case 83: // S
  case 68: // D
  case 32: // SPACE
    client.kb[event.which || event.keyCode] = false;
  }
}

// == GAME LOOP (CLIENT) ==
function loop() {
  let packet = {
    movement: null,
    shooting: null,
  }

  const move_direction = client.check_movement();
  client.player.update_velocity(move_direction, client.game);
  packet.movement = move_direction;

  const shooting = client.check_shooting();
  const projectile = client.player.process_shoot(shooting);
  if (projectile)
    client.game.projectiles.push(projectile);
  packet.shooting = shooting;

  client.player.update_position();
  // Try to predict players and projectiles movement
  client.game.update_positions();

  client.update_camera();
  client.render_frame();
  client.connection.update_server(packet);
  window.requestAnimationFrame(loop);
}

export function start_game() {
  const login_box = document.querySelector('#login_box');
  const player_info = client.connection.login();

  client.player = new Player(3, 70, player_info.color, player_info.name, client.game);

  document.querySelector('body').removeChild(login_box);

  window.addEventListener('resize', () => { 
    client.update_screen_size();
  });
  document.addEventListener("mousemove", pointerHandler, false);
  document.addEventListener("mousedown", mousedownHandler, false);
  document.addEventListener("mouseup", mouseupHandler, false);
  document.addEventListener("keydown", keyDownHandler, false);
  document.addEventListener("keyup", keyUpHandler, false);

  window.requestAnimationFrame(loop);
}

const client = new Client();