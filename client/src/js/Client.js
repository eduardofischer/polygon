import { render_map, draw_player, draw_projectile } from './canvas'
import { Connection } from './Connection.js'
import { Game } from '../../../shared/Game'

export class Client {
  constructor() {
    this.game = new Game();
    this.connection = new Connection(this);
    this.player = null;
    this.map_render = render_map(this.game);
    this.camera_x;
    this.camera_y;
    this.view_width = Math.ceil(window.innerWidth/this.game.tile_size)*this.game.tile_size; // Garante que o tamanho do game.canvas em pixels seja multiplo de tile_size
    this.view_height = Math.ceil(window.innerHeight/this.game.tile_size)*this.game.tile_size;
    this.player_screen_x = this.view_width/2;
    this.player_screen_y = this.view_height/2;
    this.canvas = document.querySelector('#game_canvas');
    this.ctx = this.canvas.getContext('2d');
    this.canvas.width = this.view_width;
    this.canvas.height = this.view_height;

    // KEYBOARD KEY-PRESS CONTROL
    this.kb = {
      87: false, // W
      65: false, // A
      83: false, // S
      68: false, // D
      32: false  // SPACE
    }
    // MOUSE BTN-PRESS CONTROL
    this.mouse = {
      1: false
    }
  }
  
  update_screen_size() {
    this.view_width = Math.ceil(window.innerWidth/this.game.tile_size)*this.game.tile_size; // Garante que o tamanho do game.canvas em pixels seja multiplo de tile_size
    this.view_height = Math.ceil(window.innerHeight/this.game.tile_size)*this.game.tile_size;
    this.player_screen_x = this.view_width/2;
    this.player_screen_y = this.view_height/2;
    this.canvas.width = this.view_width;
    this.canvas.height = this.view_height;
  }

  update_camera() {
    this.camera_x = Math.ceil(this.player.x*this.game.tile_size - this.view_width/2);
    this.camera_y = Math.ceil(this.player.y*this.game.tile_size - this.view_height/2);
  }

  draw_map() {
    this.ctx.drawImage(this.map_render, this.camera_x, this.camera_y, this.canvas.width, this.canvas.height, 0, 0, this.canvas.width, this.canvas.height);
  }

  render_frame() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.draw_map();
    // Render projectiles
    for(let p of this.get_near_projectiles())
      draw_projectile(this.ctx, p, this);
    // Render other player
    for(let p of this.get_near_players())
      draw_player(this.ctx, p, this, false);
    // Render player
    draw_player(this.ctx, this.player, this, true);
  }

  get_near_players() {
    const near_players = [];
    let pposx, pposy;
    for(let p in this.game.players_list) {
      pposx = this.players_list[p].x*this.tile_size;
      pposy = this.players_list[p].y*this.tile_size;
      if(this.players_list[p].name != this.player.name) {
        if(pposx > this.camera_x - this.game.players_list[p].size/2 && pposx < this.camera_x + this.view_width + this.game.players_list[p].size/2) {
          if(pposy > this.camera_y - this.game.players_list[p].size/2 && pposy < this.camera_y + this.view_height + this.game.players_list[p].size/2) {
            near_players.push(this.game.players_list[p]);
          }
        }
      }
    }
    return near_players;
  }
  
  get_near_projectiles() {
    const near_projectiles = [];
    let pposx, pposy;
    for(let p of this.game.projectiles) {
      pposx = p.x*this.game.tile_size;
      pposy = p.y*this.game.tile_size;
      if(pposx > this.camera_x - p.radius && pposx < this.camera_x + this.view_width + p.radius) {
        if(pposy > this.camera_y - p.radius && pposy < this.camera_y + this.view_height + p.radius) {
          near_projectiles.push(p);
        }
      }
    }
    return near_projectiles;
  }

  check_movement() {
    if (this.kb[87] && this.kb[65]) return 'NW';
    if (this.kb[87] && this.kb[68]) return 'NE';
    if (this.kb[83] && this.kb[65]) return 'SW';
    if (this.kb[83] && this.kb[68]) return 'SE';
    if (this.kb[87]) return 'N';
    if (this.kb[65]) return 'W';
    if (this.kb[83]) return 'S';
    if (this.kb[68]) return 'E';
    return null;
  }

  check_shooting() {
    if (this.mouse[1]) return this.player.angle;
    return null;
  }
}