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
        for(p of get_near_players(players_list)) {
            draw_player(this.ctx, p, this, false);
        }
        draw_player(this.ctx, player, this, true);
    }
}

function Player(n_sides, size, color, name) {
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

    this.update_velocity = () => {
        if(kb[87] && !(kb[65] || kb[68])) // Going N
            this.vy = !game.map[parseInt(this.x)][parseInt(this.y - this.hit_radius - this.max_velocity)].colision ? -this.max_velocity : colision_limit('N', this);
        else if(kb[83] && !(kb[65] || kb[68])) // Going S
            this.vy = !game.map[parseInt(this.x)][parseInt(this.y + this.hit_radius + this.max_velocity)].colision ? this.max_velocity  : colision_limit('S', this);
        else if(kb[87]) // Going NW or NE
            this.vy = !game.map[parseInt(this.x)][parseInt(this.y - this.hit_radius - this.max_velocity/Math.sqrt(2))].colision ? -this.max_velocity/Math.sqrt(2) : colision_limit('NX', this);
        else if(kb[83])
            this.vy = !game.map[parseInt(this.x)][parseInt(this.y + this.hit_radius + this.max_velocity/Math.sqrt(2))].colision ? this.max_velocity/Math.sqrt(2) : colision_limit('SX', this);
        else
            this.vy = 0;

        if(kb[65] && !(kb[87] || kb[83])) // Going W
            this.vx = !game.map[parseInt(this.x - this.hit_radius - this.max_velocity)][parseInt(this.y)].colision ? -this.max_velocity : colision_limit('W', this);
        else if(kb[68] && !(kb[87] || kb[83])) // Going E
            this.vx = !game.map[parseInt(this.x + this.hit_radius + this.max_velocity)][parseInt(this.y)].colision ? this.max_velocity : colision_limit('E', this);
        else if(kb[65])
            this.vx = !game.map[parseInt(this.x - this.hit_radius - this.max_velocity/Math.sqrt(2))][parseInt(this.y)].colision ? -this.max_velocity/Math.sqrt(2) : colision_limit('XW', this);
        else if(kb[68])
            this.vx = !game.map[parseInt(this.x + this.hit_radius + this.max_velocity/Math.sqrt(2))][parseInt(this.y)].colision ? this.max_velocity/Math.sqrt(2) : colision_limit('XE', this);
        else
            this.vx = 0;
    }

    this.update_position = () => {
        this.x += this.vx;
        this.y += this.vy;
    }

    this.update = (p) => {
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
}

function Connection() {
    this.socket = io();

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
    } 
}

// RANDOM MAP GENERATOR
function generate_map(game) {
    const map = [];
    const grid_width = game.map_width + 2*game.map_margin;
    const grid_height = game.map_height + 2*game.map_margin;

    for (x=0; x < grid_width; x++) {
        let rand;
        map[x] = [];
        for(y=0; y < grid_height; y++) {
            rand = Math.random();
            if (x < game.map_margin || y < game.map_margin || x >= grid_width - game.map_margin || y >= grid_height - game.map_margin) {
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

// MOUSE
function pointerHandler(event) {
    const relative_x = parseInt(event.clientX - game.player_screen_x);
    const relative_y = parseInt(game.player_screen_y - event.clientY);
    player.angle = Math.acos(relative_x/Math.sqrt(Math.pow(relative_x, 2) + Math.pow(relative_y, 2))) * 180/Math.PI;
    if (relative_y < 0)
        player.angle = 360 - player.angle;
}

// KEYBOARD
const kb = {
    87: false, // W
    65: false, // A
    83: false, // S
    68: false  // D
}

function keyDownHandler(event) {
    switch(event.which || event.keyCode) {
        case 87: // W
        case 65: // A
        case 83: // S
        case 68: // D
            kb[event.which || event.keyCode] = true;
    }
}

function keyUpHandler(event) {
    switch(event.which || event.keyCode) {
        case 87: // W
        case 65: // A
        case 83: // S
        case 68: // D
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

function loop() {
    player.update_velocity();
    player.update_position();
    for(p in players_list) // Prevê a movimentação dos players
        if(p != player.name)
            players_list[p].update_position();
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
    document.addEventListener("keydown", keyDownHandler, false);
    document.addEventListener("keyup", keyUpHandler, false);

    window.requestAnimationFrame(loop);
}

let game = new Game();
let conn = new Connection();
let player;
let players_list = {}; // Players List