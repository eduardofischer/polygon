const INITIAL_PLAYER_N_SIDES = 3;
const INITIAL_PLAYER_SIZE = 70;

const Game = require('@shared/Game');
const Player = require('@shared/Player');
const chalk = require('chalk');
// const nanoid = require('nanoid');
const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
})

const player_updates = {};

// GAME SERVER START SEQUENCE
const game = new Game();

function game_loop(io) {
  for (p in player_updates) {
    if (p in game.players) {
      // Update players velocity
      game.players[p].update_velocity(player_updates[p].movement, game);
      // Process players shooting
      const projectile = game.players[p].process_shoot(player_updates[p].shooting);
      if (projectile)
        game.projectiles.push(projectile);
    } else
      console.log(`Player ${p} not found in players list`);
  }
  // Update global positions
  game.update_positions();

  // Send updated players and projectiles to clients
  io.in('game').emit('state_update', { players: game.players, projectiles: game.projectiles });
}

function handle_connection(socket) {
  let this_player = undefined;

  socket.join('game');
  
  socket.on('new_player', msg => {
    const player = new Player(INITIAL_PLAYER_N_SIDES, INITIAL_PLAYER_SIZE, msg.color, msg.name, game);
    console.log(`[${socket.handshake.address}] ${player.name} joined the game`);
    game.players[player.name] = player;
    this_player = player.name;
  });
  
  socket.on('player_update', packet => {
    if (this_player) {
      if (packet.angle)
        game.players[this_player].angle = packet.angle;
      player_updates[this_player] = packet;
    }
  });
  
  socket.on('projectiles_update', p => {
    projectiles.push(...p);
    socket.emit('state_update', player_list);
  });
  
  socket.on('disconnect', () => {
    if(this_player){
      delete game.players[this_player];
      delete player_updates[this_player];
      socket.broadcast.emit('player_disconnected', this_player);
      console.log(`[${socket.handshake.address}] ${this_player} left the game`);
    }
  });
}

async function cmd_prompt() {
  readline.question('', cmd => {
    switch (cmd) {
      case 'players':
        console.log('\nCurrent Players:');
        for (p in game.players)
          console.log(`- ${chalk.hex(game.players[p].color)(game.players[p].name)}`);
        break;
    }
    cmd_prompt();
  })
}

module.exports = { handle_connection, game_loop, cmd_prompt }