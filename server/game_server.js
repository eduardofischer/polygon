const Game = require('@shared/Game');

let player_list = {};
let projectiles = [];

function game_loop() {
  
}

function handle_connection(socket) {
  let this_player = '';
  
  socket.join('unique_room');
  
  socket.on('new_player', msg => {
    console.log(msg.user, 'joined the game!');
    this_player = msg.user;
  });
  
  socket.on('player_update', player => {
    player_list[player.name] = player;
    socket.emit('state_update', player_list);
  });
  
  socket.on('projectiles_update', p => {
    projectiles.push(...p);
    socket.emit('state_update', player_list);
  });
  
  socket.on('disconnect', () => {
    if(this_player.length > 0){
      delete player_list[this_player];
      socket.broadcast.emit('player_disconnected', this_player);
      console.log(this_player, 'left the game.');
    }
  });
}

module.exports = { handle_connection, game_loop }