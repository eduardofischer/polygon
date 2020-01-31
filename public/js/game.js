const game = {
    view_width: 0,
    view_height: 0,
    camera_x: 0,
    camera_y: 0,
    map_margin: 100,
    map: [],
    map_width: 256,
    map_height: 256,
    tile_size: 20
}
game.view_width = Math.ceil(window.innerWidth/game.tile_size)*game.tile_size; // Garante que o tamanho do canvas em pixels seja multiplo de tile_size
game.view_height = Math.ceil(window.innerHeight/game.tile_size)*game.tile_size;

const player = {
    angle: 0,
    pos_x: 180,
    pos_y: 180,
    speed_x: 0,
    speed_y: 0,
    size: 80,
    screen_x: game.view_width/2,
    screen_y: game.view_height/2,
    color: '#e74c3c',
    max_speed: 0.3,
    hit_radius: 0,
    n_sides: 3,
    name: ''
}
player.hit_radius = Math.floor((1/3 * player.size)/game.tile_size);

const canvas = document.querySelector('#game_canvas')
const ctx = canvas.getContext('2d')

canvas.width = game.view_width;
canvas.height = game.view_height;

// RANDOM MAP GENERATOR
const grid_width = game.map_width + 2*game.map_margin;
const grid_height = game.map_height + 2*game.map_margin;

for (x=0; x < grid_width; x++) {
    let rand;
    game.map[x] = [];
    for(y=0; y < grid_height; y++) {
        rand = Math.random();
        if (x < game.map_margin || y < game.map_margin || x >= grid_width - game.map_margin || y >= grid_height - game.map_margin) {
            game.map[x][y] = {color: '#ecf0f1', colision: true};
        } else {
            if (rand < 0.7)
                game.map[x][y] = {color: '#2ecc71', colision: false};
            else if (rand < 0.995)
                game.map[x][y] = {color: '#27ae60', colision: false};
            else    
                game.map[x][y] = {color: '#2c3e50', colision: false};
        }
    }
}

const map_render = draw_map(game);

// MOUSE

document.addEventListener("mousemove", pointerHandler, false);

function pointerHandler(event) {
    const relative_x = parseInt(event.clientX - player.screen_x);
    const relative_y = parseInt(player.screen_y - event.clientY);
    player.angle = Math.acos(relative_x/Math.sqrt(Math.pow(relative_x, 2) + Math.pow(relative_y, 2))) * 180/Math.PI;
    if (relative_y < 0)
        player.angle = 360 - player.angle;
    //console.log(`x: ${relative_x}, y: ${relative_y}, angle: ${player.angle}\n`);
}

// KEYBOARD

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

const kb = {
    87: false, // W
    65: false, // A
    83: false, // S
    68: false // D
}

function keyDownHandler(event) {
    switch(event.which || event.keyCode) {
        case 87: // W
        case 65: // A
        case 83: // S
        case 68: // D
            kb[event.which || event.keyCode] = true;

        // console.log(event.which || event.keyCode);
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
    let spd = player.max_speed;
    switch(direction) {
        case 'N':
            while(spd >= 0) {
                spd -= 0.1;
                if(game.map[parseInt(player.pos_x)][parseInt(player.pos_y - player.hit_radius - spd)].colision == false)
                    return -spd;
            }
            break;
        case 'NX':
            while(spd >= 0) {
                spd -= 0.1;
                if(game.map[parseInt(player.pos_x)][parseInt(player.pos_y - player.hit_radius - spd/Math.sqrt(2))].colision == false)
                    return -spd/Math.sqrt(2);
            }
            break;
        case 'S':
            while(spd >= 0) {
                spd -= 0.1;
                if(game.map[parseInt(player.pos_x)][parseInt(player.pos_y + player.hit_radius + spd)].colision == false)
                    return spd;
            }
            break;
        case 'SX':
            while(spd >= 0) {
                spd -= 0.1;
                if(game.map[parseInt(player.pos_x)][parseInt(player.pos_y + player.hit_radius + spd/Math.sqrt(2))].colision == false)
                    return spd/Math.sqrt(2);
            }
            break;
        case 'W':
            while(spd >= 0) {
                spd -= 0.1;
                if(game.map[parseInt(player.pos_x - player.hit_radius - spd)][parseInt(player.pos_y)].colision == false)
                    return -spd;
            }
            break;
        case 'XW':
            while(spd >= 0) {
                spd -= 0.1;
                if(game.map[parseInt(player.pos_x - player.hit_radius - spd/Math.sqrt(2))][parseInt(player.pos_y)].colision == false)
                    return -spd/Math.sqrt(2);
            }
            break;
        case 'E':
            while(spd >= 0) {
                spd -= 0.1;
                if(game.map[parseInt(player.pos_x + player.hit_radius + spd)][parseInt(player.pos_y)].colision == false)
                    return spd;
            }
            break;
        case 'XE':
        while(spd >= 0) {
            spd -= 0.1;
            if(game.map[parseInt(player.pos_x + player.hit_radius + spd/Math.sqrt(2))][parseInt(player.pos_y)].colision == false)
                return spd/Math.sqrt(2);
        }
        break;
    }
}

function process_movements() {
    if(kb[87] && !(kb[65] || kb[68])) // Going N
        player.speed_y = !game.map[parseInt(player.pos_x)][parseInt(player.pos_y - player.hit_radius - player.max_speed)].colision ? -player.max_speed : colision_limit('N', player);
    else if(kb[83] && !(kb[65] || kb[68])) // Going S
        player.speed_y = !game.map[parseInt(player.pos_x)][parseInt(player.pos_y + player.hit_radius + player.max_speed)].colision ? player.max_speed  : colision_limit('S', player);
    else if(kb[87]) // Going NW or NE
        player.speed_y = !game.map[parseInt(player.pos_x)][parseInt(player.pos_y - player.hit_radius - player.max_speed/Math.sqrt(2))].colision ? -player.max_speed/Math.sqrt(2) : colision_limit('NX', player);
    else if(kb[83])
        player.speed_y = !game.map[parseInt(player.pos_x)][parseInt(player.pos_y + player.hit_radius + player.max_speed/Math.sqrt(2))].colision ? player.max_speed/Math.sqrt(2) : colision_limit('SX', player);
    else
        player.speed_y = 0;

    if(kb[65] && !(kb[87] || kb[83])) // Going W
        player.speed_x = !game.map[parseInt(player.pos_x - player.hit_radius - player.max_speed)][parseInt(player.pos_y)].colision ? -player.max_speed : colision_limit('W', player);
    else if(kb[68] && !(kb[87] || kb[83])) // Going E
        player.speed_x = !game.map[parseInt(player.pos_x + player.hit_radius + player.max_speed)][parseInt(player.pos_y)].colision ? player.max_speed : colision_limit('E', player);
    else if(kb[65])
        player.speed_x = !game.map[parseInt(player.pos_x - player.hit_radius - player.max_speed/Math.sqrt(2))][parseInt(player.pos_y)].colision ? -player.max_speed/Math.sqrt(2) : colision_limit('XW', player);
    else if(kb[68])
        player.speed_x = !game.map[parseInt(player.pos_x + player.hit_radius + player.max_speed/Math.sqrt(2))][parseInt(player.pos_y)].colision ? player.max_speed/Math.sqrt(2) : colision_limit('XE', player);
    else
        player.speed_x = 0;
}

function get_near_players(players_list) {
    const near_players = [];
    let pposx, pposy;
    for(let p in players_list) {
        pposx = players_list[p].pos_x*game.tile_size;
        pposy = players_list[p].pos_y*game.tile_size;
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

function update_positions() {
    // Atualiza a posição do jogador
    player.pos_x += player.speed_x;
    player.pos_y += player.speed_y;

    // Preve a posição dos demais jogadores
    for(p in players_list) {
        p.pos_x += p.speed_x;
        p.pos_y += p.speed_y;
    }

    game.camera_x = Math.ceil(player.pos_x*game.tile_size - game.view_width/2);
    game.camera_y = Math.ceil(player.pos_y*game.tile_size - game.view_height/2);
}

function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(map_render, game.camera_x, game.camera_y, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height);
    for(p of get_near_players(players_list)) {
        draw_player(ctx, p, game, false);
    }
    draw_player(ctx, player, game, true);
}

function loop() {
    process_movements();
    update_positions();
    render();
    update_server(player);
    window.requestAnimationFrame(loop);
}

function start_game() {
    const login_box = document.querySelector('#login_box');
    const player_info = login();
    player.name = player_info.name;
    player.color = player_info.color;
    document.querySelector('body').removeChild(login_box);
    window.requestAnimationFrame(loop);
}

update_positions();
ctx.drawImage(map_render, game.camera_x, game.camera_y, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height);
