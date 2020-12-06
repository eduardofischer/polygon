import { io } from 'socket.io-client'
import { Player } from '../../../shared/Player'

export class Connection {
  constructor(client) {
    this.socket = process.env.SERVER_URL ? io(process.env.SERVER_URL) : io();

    this.socket.on('state_update', list => {
      for(let p in list) {
        if(p != client.player.name) {
          if(client.players_list[p] == undefined)
            client.players_list[p] = new Player(list[p].n_sides, list[p].size, list[p].color, list[p].name, client.game);
          client.players_list[p].update(list[p]);
        }
      }
    });
  
    this.socket.on('player_disconnected', name => {
      delete client.players_list[name];
    });
  }

  login() {
    const name = document.querySelector('#username_input').value;
    const color = document.querySelector('#colors').dataset.color;
    this.socket.emit('new_player', {user: name});

    return {name, color};
  }

  update_server(packet) {
    this.socket.emit('player_update', packet);
  }
}