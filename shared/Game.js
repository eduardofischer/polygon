export class Game {
  constructor() {
    this.map_margin = 100;
    this.map = [];
    this.map_width = 256;
    this.map_height = 256;
    this.tile_size = 20;
    this.map = this.generate_map();
    this.players_list = [];
    this.projectiles = [];
  }
  
  generate_map() {
    const map = [];
    const grid_width = this.map_width + 2*this.map_margin;
    const grid_height = this.map_height + 2*this.map_margin;

    for (let x=0; x < grid_width; x++) {
      let rand;
      map[x] = [];
      for(let y=0; y < grid_height; y++) {
        rand = Math.random();
        if (x < this.map_margin || y < this.map_margin || x >= grid_width - this.map_margin || y >= grid_height - this.map_margin) {
          map[x][y] = {color: '#ecf0f1', colision: true};
        } else {
          if (rand < 0.7)
            map[x][y] = {color: '#2ecc71', colision: false};
          else if (rand < 0.995)
            map[x][y] = {color: '#27ae60', colision: false};
          else  
            map[x][y] = {color: '#2c3e50', colision: false};
        }
      }
    }
    return map;
  }

  get_near_players(player) {
    const near_players = [];
    let pposx, pposy;
    for(let p in this.players_list) {
      pposx = this.players_list[p].x*this.game.tile_size;
      pposy = this.players_list[p].y*this.game.tile_size;
      if(this.players_list[p].name != player.name) {
        if(pposx > this.game.camera_x - this.players_list[p].size/2 && pposx < this.game.camera_x + this.game.view_width + this.players_list[p].size/2) {
          if(pposy > this.game.camera_y - this.players_list[p].size/2 && pposy < this.game.camera_y + this.game.view_height + this.players_list[p].size/2) {
            near_players.push(this.players_list[p]);
          }
        }
      }
    }
    return near_players;
  }
  
  get_near_projectiles(player) {
    const near_projectiles = [];
    let pposx, pposy;
    for(let p of this.projectiles) {
      pposx = p.x*this.game.tile_size;
      pposy = p.y*this.game.tile_size;
      if(p.name != player.name) {
        if(pposx > this.game.camera_x - p.radius && pposx < this.game.camera_x + this.game.view_width + p.radius) {
          if(pposy > this.game.camera_y - p.radius && pposy < this.game.camera_y + this.game.view_height + p.radius) {
            near_projectiles.push(p);
          }
        }
      }
    }
    return near_projectiles;
  }

  update_positions() {
    // Update players positions
    this.players_list.forEach(p => {
      p.update_position();
    })
  
    // Update projectiles positions
    this.projectiles.forEach((p, i) => {
      if(p.dtl > 0)
        p.update_position();
      else
        this.projectiles.splice(i, 1);
    });
  }
}