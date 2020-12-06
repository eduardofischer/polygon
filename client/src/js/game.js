import { io } from 'socket.io-client'

import { render_map } from './canvas'
import { generate_map } from '../../../shared/Map'

const PLAYER_SPAWN_X = 228;
const PLAYER_SPAWN_Y = 228;
const INITIAL_MAX_SPEED = 0.2;

function Game() {
    this.map_margin = 100;
    this.map = [];
    this.map_width = 256;
    this.map_height = 256;
    this.tile_size = 20;
    this.view_width = Math.ceil(window.innerWidth/this.tile_size)*this.tile_size; // Garante que o tamanho do game.canvas em pixels seja multiplo de tile_size
    this.view_height = Math.ceil(window.innerHeight/this.tile_size)*this.tile_size;
    this.player_screen_x = this.view_width/2;
    this.player_screen_y = this.view_height/2;
    this.canvas = document.querySelector('#game_canvas');
    this.ctx = this.canvas.getContext('2d');
    this.canvas.width = this.view_width;
    this.canvas.height = this.view_height;
    this.map = generate_map(this);
    this.map_render = render_map(this);
    this.camera_x;
    this.camera_y;

    this.update_screen_size = () => {
        this.view_width = Math.ceil(window.innerWidth/this.tile_size)*this.tile_size; // Garante que o tamanho do game.canvas em pixels seja multiplo de tile_size
        this.view_height = Math.ceil(window.innerHeight/this.tile_size)*this.tile_size;
        this.player_screen_x = this.view_width/2;
        this.player_screen_y = this.view_height/2;
        this.canvas.width = this.view_width;
        this.canvas.height = this.view_height;
    }

    this.update_camera = () => {
        this.camera_x = Math.ceil(player.x*this.tile_size - this.view_width/2);
        this.camera_y = Math.ceil(player.y*this.tile_size - this.view_height/2);
    }

    this.draw_map = () => {
        this.ctx.drawImage(this.map_render, this.camera_x, this.camera_y, this.canvas.width, this.canvas.height, 0, 0, this.canvas.width, this.canvas.height);
    }

    this.render_frame = () => {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.draw_map();
        // Render projectiles
        for(p of get_near_projectiles(projectiles))
            draw_projectile(this.ctx, p, this);
        // Render other player
        for(p of get_near_players(players_list))
            draw_player(this.ctx, p, this, false);
        // Render player
        draw_player(this.ctx, player, this, true);
    }
}

function Connection() {
    this.socket = process.env.SERVER_URL ? io(process.env.SERVER_URL) : io();

    this.socket.on('state_update', list => {
        for(p in list) {
            if(p != player.name) {
               if(players_list[p] == undefined)
                    players_list[p] = new Player(list[p].n_sides, list[p].size, list[p].color, list[p].name);
                players_list[p].update(list[p]); 
            }
        }
    });

    this.socket.on('player_disconnected', name => {
        delete players_list[name];
    });

    this.login = () => {
        const name = document.querySelector('#username_input').value;
        const color = document.querySelector('#colors').dataset.color;
        this.socket.emit('new_player', {user: name});
    
        return {name, color};
    }
    
    this.update_server = () => {
        this.socket.emit('player_update', player);
        this.socket.emit('projectiles_update', new_projectiles);
        new_projectiles = [];
    } 
}

// MOUSE
function pointerHandler(event) {
    const relative_x = parseInt(event.clientX - game.player_screen_x);
    const relative_y = parseInt(game.player_screen_y - event.clientY);
    player.angle = Math.acos(relative_x/Math.sqrt(Math.pow(relative_x, 2) + Math.pow(relative_y, 2))) * 180/Math.PI;
    if (relative_y < 0)
        player.angle = 360 - player.angle;
}

function mousedownHandler(event) {
    mouse[1] = true
}

function mouseupHandler(event) {
    mouse[1] = false
}

// KEYBOARD
const kb = {
    87: false, // W
    65: false, // A
    83: false, // S
    68: false, // D
    32: false  // SPACE
}

const mouse = {
    1: false
}

function keyDownHandler(event) {
    switch(event.which || event.keyCode) {
        case 87: // W
        case 65: // A
        case 83: // S
        case 68: // D
        case 32: // SPACE
            kb[event.which || event.keyCode] = true;
    }
}

function keyUpHandler(event) {
    switch(event.which || event.keyCode) {
        case 87: // W
        case 65: // A
        case 83: // S
        case 68: // D
        case 32: // SPACE
            kb[event.which || event.keyCode] = false;
    }
}

// MOVEMENT
function colision_limit(direction, player) {
    let spd = player.max_velocity;
    switch(direction) {
        case 'N':
            while(spd >= 0) {
                spd -= 0.1;
                if(game.map[parseInt(player.x)][parseInt(player.y - player.hit_radius - spd)].colision == false)
                    return -spd;
            }
            break;
        case 'NX':
            while(spd >= 0) {
                spd -= 0.1;
                if(game.map[parseInt(player.x)][parseInt(player.y - player.hit_radius - spd/Math.sqrt(2))].colision == false)
                    return -spd/Math.sqrt(2);
            }
            break;
        case 'S':
            while(spd >= 0) {
                spd -= 0.1;
                if(game.map[parseInt(player.x)][parseInt(player.y + player.hit_radius + spd)].colision == false)
                    return spd;
            }
            break;
        case 'SX':
            while(spd >= 0) {
                spd -= 0.1;
                if(game.map[parseInt(player.x)][parseInt(player.y + player.hit_radius + spd/Math.sqrt(2))].colision == false)
                    return spd/Math.sqrt(2);
            }
            break;
        case 'W':
            while(spd >= 0) {
                spd -= 0.1;
                if(game.map[parseInt(player.x - player.hit_radius - spd)][parseInt(player.y)].colision == false)
                    return -spd;
            }
            break;
        case 'XW':
            while(spd >= 0) {
                spd -= 0.1;
                if(game.map[parseInt(player.x - player.hit_radius - spd/Math.sqrt(2))][parseInt(player.y)].colision == false)
                    return -spd/Math.sqrt(2);
            }
            break;
        case 'E':
            while(spd >= 0) {
                spd -= 0.1;
                if(game.map[parseInt(player.x + player.hit_radius + spd)][parseInt(player.y)].colision == false)
                    return spd;
            }
            break;
        case 'XE':
        while(spd >= 0) {
            spd -= 0.1;
            if(game.map[parseInt(player.x + player.hit_radius + spd/Math.sqrt(2))][parseInt(player.y)].colision == false)
                return spd/Math.sqrt(2);
        }
        break;
    }
}

function get_near_players(players_list) {
    const near_players = [];
    let pposx, pposy;
    for(let p in players_list) {
        pposx = players_list[p].x*game.tile_size;
        pposy = players_list[p].y*game.tile_size;
        if(players_list[p].name != player.name) {
            if(pposx > game.camera_x - players_list[p].size/2 && pposx < game.camera_x + game.view_width + players_list[p].size/2) {
                if(pposy > game.camera_y - players_list[p].size/2 && pposy < game.camera_y + game.view_height + players_list[p].size/2) {
                    near_players.push(players_list[p]);
                }
            }
        }
    }
    return near_players;
}

function get_near_projectiles(projectiles) {
    const near_projectiles = [];
    let pposx, pposy;
    for(let p of projectiles) {
        pposx = p.x*game.tile_size;
        pposy = p.y*game.tile_size;
        if(p.name != player.name) {
            if(pposx > game.camera_x - p.radius && pposx < game.camera_x + game.view_width + p.radius) {
                if(pposy > game.camera_y - p.radius && pposy < game.camera_y + game.view_height + p.radius) {
                    near_projectiles.push(p);
                }
            }
        }
    }
    return near_projectiles;
}

function update_positions() {
    // Update local player position
    player.update_position();

    // Predicts other players movements
    for(p in players_list) 
        if(p != player.name)
            players_list[p].update_position();

    // Update projectiles positions
    projectiles.forEach((p, i) => {
        if(p.dtl > 0)
            p.update_position();
        else
            projectiles.splice(i, 1);
    });
}

function loop() {
    // console.log(player.angle);
    player.update_velocity();
    player.process_shoot();
    update_positions();
    game.update_camera();
    game.render_frame();
    conn.update_server();
    window.requestAnimationFrame(loop);
}

function start_game() {
    const login_box = document.querySelector('#login_box');
    const player_info = conn.login();

    player = new Player(3, 70, player_info.color, player_info.name);

    document.querySelector('body').removeChild(login_box);

    window.addEventListener('resize', game.update_screen_size);
    document.addEventListener("mousemove", pointerHandler, false);
    document.addEventListener("mousedown", mousedownHandler, false);
    document.addEventListener("mouseup", mouseupHandler, false);
    document.addEventListener("keydown", keyDownHandler, false);
    document.addEventListener("keyup", keyUpHandler, false);

    window.requestAnimationFrame(loop);
}

let game = new Game();
let conn = new Connection();
let player;
let players_list = {}; // Players List
let projectiles = [];
let new_projectiles = [];

export { start_game }