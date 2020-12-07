const PROJ_DEFAULT_DTL = 30;
const PROJ_DEFAULT_RADIUS = 10;
const PROJ_DEFAULT_POWER = 10;

class Projectile {
  constructor (player){
    this.x = player.x;
    this.y = player.y;
    this.vx = player.projectile_velocity * Math.cos(player.angle*Math.PI/180);
    this.vy = -(player.projectile_velocity * Math.sin(player.angle*Math.PI/180));
    this.power = PROJ_DEFAULT_POWER;
    this.radius = PROJ_DEFAULT_RADIUS;
    this.player = player.name;
    this.dtl = PROJ_DEFAULT_DTL; // distance-to-live
    this.color = '#ecf0f1';
  }
  
  update_position() {
    this.x += this.vx;
    this.y += this.vy;
    this.dtl -= Math.sqrt(Math.pow(this.vx, 2) + Math.pow(this.vy, 2));
  }
}

module.exports = Projectile;