const Projectile = require('./Projectile');

const PLAYER_SPAWN_X = 228;
const PLAYER_SPAWN_Y = 228;
const INITIAL_MAX_SPEED = 0.2;
const PLAYER_DEFAULT_FIRE_PERIOD = 30;

class Player {
  constructor(n_sides, size, color, name, game) {
    this.x = PLAYER_SPAWN_X;
    this.y = PLAYER_SPAWN_Y;
    this.vx = 0;
    this.vy = 0;
    this.angle = 0;
    this.size = size;
    this.color = color;
    this.n_sides = n_sides;
    this.max_velocity = INITIAL_MAX_SPEED;
    this.hit_radius = Math.floor((1/3 * this.size)/game.tile_size);
    this.name = name;
    this.projectile_velocity = 0.3;
    this.fire_period = PLAYER_DEFAULT_FIRE_PERIOD;
    this.fire_count = PLAYER_DEFAULT_FIRE_PERIOD;
  }

  update_velocity(direction, game) {
    switch(direction) {
    case 'N':
      this.vx = 0;
      this.vy = !game.map[parseInt(this.x)][parseInt(this.y - this.hit_radius - this.max_velocity)].colision ? -this.max_velocity : this.colision_limit('N');
      break;
    case 'S':
      this.vx = 0;
      this.vy = !game.map[parseInt(this.x)][parseInt(this.y + this.hit_radius + this.max_velocity)].colision ? this.max_velocity  : this.colision_limit('S');
      break;
    case 'W':
      this.vx = !game.map[parseInt(this.x - this.hit_radius - this.max_velocity)][parseInt(this.y)].colision ? -this.max_velocity : this.colision_limit('W');
      this.vy = 0;
      break;
    case 'E':
      this.vx = !game.map[parseInt(this.x + this.hit_radius + this.max_velocity)][parseInt(this.y)].colision ? this.max_velocity : this.colision_limit('E');
      this.vy = 0;
      break;
    case 'NW':
      this.vx = !game.map[parseInt(this.x - this.hit_radius - this.max_velocity/Math.sqrt(2))][parseInt(this.y)].colision ? -this.max_velocity/Math.sqrt(2) : this.colision_limit('XW');
      this.vy = !game.map[parseInt(this.x)][parseInt(this.y - this.hit_radius - this.max_velocity/Math.sqrt(2))].colision ? -this.max_velocity/Math.sqrt(2) : this.colision_limit('NX');
      break;
    case 'NE':
      this.vx = !game.map[parseInt(this.x + this.hit_radius + this.max_velocity/Math.sqrt(2))][parseInt(this.y)].colision ? this.max_velocity/Math.sqrt(2) : this.colision_limit('XE');
      this.vy = !game.map[parseInt(this.x)][parseInt(this.y - this.hit_radius - this.max_velocity/Math.sqrt(2))].colision ? -this.max_velocity/Math.sqrt(2) : this.colision_limit('NX');
      break;
    case 'SW':
      this.vx = !game.map[parseInt(this.x - this.hit_radius - this.max_velocity/Math.sqrt(2))][parseInt(this.y)].colision ? -this.max_velocity/Math.sqrt(2) : this.colision_limit('XW');
      this.vy = !game.map[parseInt(this.x)][parseInt(this.y + this.hit_radius + this.max_velocity/Math.sqrt(2))].colision ? this.max_velocity/Math.sqrt(2) : this.colision_limit('SX');
      break;
    case 'SE':
      this.vx = !game.map[parseInt(this.x + this.hit_radius + this.max_velocity/Math.sqrt(2))][parseInt(this.y)].colision ? this.max_velocity/Math.sqrt(2) : this.colision_limit('XE');
      this.vy = !game.map[parseInt(this.x)][parseInt(this.y + this.hit_radius + this.max_velocity/Math.sqrt(2))].colision ? this.max_velocity/Math.sqrt(2) : this.colision_limit('SX');
      break;
    default:
      this.vx = 0;
      this.vy = 0;
    }
  }

  update_position() {
    this.x += this.vx;
    this.y += this.vy;
  }

  update(p) {
    this.n_sides = p.n_sides;
    this.x = p.x;
    this.y = p.y;
    this.vx = p.vx;
    this.vy = p.vy;
    this.angle = p.angle;
    this.size = p.size;
    this.color = p.color;
    this.max_velocity = p.max_velocity;
    this.hit_radius = p.hit_radius;
  }

  fire() {
    this.fire_count = this.fire_period;
    return new Projectile(this);
  }

  process_shoot(shoot_btn_pressed) {
    if (shoot_btn_pressed && this.fire_count <= 0)
      return this.fire();

    if(this.fire_count > 0)
      this.fire_count--;
    
    return null;
  }

  colision_limit(direction, game) {
    let spd = this.max_velocity;
    switch(direction) {
    case 'N':
      while(spd >= 0) {
        spd -= 0.1;
        if(game.map[parseInt(this.x)][parseInt(this.y - this.hit_radius - spd)].colision == false)
          return -spd;
      }
      break;
    case 'NX':
      while(spd >= 0) {
        spd -= 0.1;
        if(game.map[parseInt(this.x)][parseInt(this.y - this.hit_radius - spd/Math.sqrt(2))].colision == false)
          return -spd/Math.sqrt(2);
      }
      break;
    case 'S':
      while(spd >= 0) {
        spd -= 0.1;
        if(game.map[parseInt(this.x)][parseInt(this.y + this.hit_radius + spd)].colision == false)
          return spd;
      }
      break;
    case 'SX':
      while(spd >= 0) {
        spd -= 0.1;
        if(game.map[parseInt(this.x)][parseInt(this.y + this.hit_radius + spd/Math.sqrt(2))].colision == false)
          return spd/Math.sqrt(2);
      }
      break;
    case 'W':
      while(spd >= 0) {
        spd -= 0.1;
        if(game.map[parseInt(this.x - this.hit_radius - spd)][parseInt(this.y)].colision == false)
          return -spd;
      }
      break;
    case 'XW':
      while(spd >= 0) {
        spd -= 0.1;
        if(game.map[parseInt(this.x - this.hit_radius - spd/Math.sqrt(2))][parseInt(this.y)].colision == false)
          return -spd/Math.sqrt(2);
      }
      break;
    case 'E':
      while(spd >= 0) {
        spd -= 0.1;
        if(game.map[parseInt(this.x + this.hit_radius + spd)][parseInt(this.y)].colision == false)
          return spd;
      }
      break;
    case 'XE':
      while(spd >= 0) {
        spd -= 0.1;
        if(game.map[parseInt(this.x + this.hit_radius + spd/Math.sqrt(2))][parseInt(this.y)].colision == false)
          return spd/Math.sqrt(2);
      }
      break;
    }
  }
}

module.exports = Player;