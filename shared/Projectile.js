export function Projectile(player) {
  this.x = player.x;
  this.y = player.y;
  this.vx = player.projectile_velocity * Math.cos(player.angle*Math.PI/180);
  this.vy = -(player.projectile_velocity * Math.sin(player.angle*Math.PI/180));
  this.power = 10;
  this.radius = 10;
  this.player = player.name;
  this.dtl = 20; // distance-to-live
  this.color = '#ecf0f1';

  this.update_position = () => {
    this.x += this.vx;
    this.y += this.vy;
    this.dtl -= Math.sqrt(Math.pow(this.vx, 2) + Math.pow(this.vy, 2));
  }
}
