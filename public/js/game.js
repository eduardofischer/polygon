const game = {
    view_width: window.innerWidth,
    view_height: window.innerHeight,
    camera_x: 100,
    camera_y: 100
}

const map = {
    width: 200,
    height: 200,
    tile_size: 10,
    grid: [],
    margin_space: 50
}

const player = {
    angle: 0,
    pos_x: game.view_width/2,
    pos_y: game.view_height/2,
    color: '#e74c3c',
    speed: 1
}

const kb = {
    87: false, // W
    65: false, // A
    83: false, // S
    68: false // D
}

const canvas = document.querySelector('#game_canvas')
const ctx = canvas.getContext('2d')

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Random Map Generation
const grid_width = map.width + 2*map.margin_space;
const grid_height = map.height + 2*map.margin_space;

for (x=0; x < grid_width; x++) {
    let rand;
    map.grid[x] = [];
    for(y=0; y < grid_height; y++) {
        rand = Math.random();
        if (x < map.margin_space || y < map.margin_space || x >= grid_width - map.margin_space || y >= grid_height - map.margin_space) {
            map.grid[x][y] = {color: '#ecf0f1'};
        } else {
            if (rand < 0.7)
                map.grid[x][y] = {color: '#2ecc71'};
            else if (rand < 0.995)
                map.grid[x][y] = {color: '#27ae60'};
            else    
                map.grid[x][y] = {color: '#2c3e50'};
        }
    }
}

const map_render = draw_map();

document.addEventListener("mousemove", pointerHandler, false);
document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

function pointerHandler(event) {
    const relative_x = parseInt(event.clientX - player.pos_x);
    const relative_y = parseInt(player.pos_y - event.clientY);
    player.angle = Math.acos(relative_x/Math.sqrt(Math.pow(relative_x, 2) + Math.pow(relative_y, 2))) * 180/Math.PI;
    if (relative_y < 0)
        player.angle = 360 - player.angle;
    //console.log(`x: ${relative_x}, y: ${relative_y}, angle: ${player.angle}\n`);
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

function updateGame() {
    if(kb[87])
        game.camera_y = (game.camera_y - player.speed) >= 0 ? (game.camera_y - player.speed) : 0;
    else if(kb[83])
        game.camera_y = (game.camera_y + player.speed) <= (grid_height - Math.ceil(game.view_height/map.tile_size)) ? (game.camera_y + player.speed) : (grid_height - Math.ceil(game.view_height/map.tile_size));

    if(kb[65])
        game.camera_x = (game.camera_x - player.speed) >= 0 ? (game.camera_x - player.speed) : 0;
    else if(kb[68])
        game.camera_x = (game.camera_x + player.speed) <= (grid_width - Math.ceil(game.view_width/map.tile_size)) ? (game.camera_x + player.speed) : (grid_width - Math.ceil(game.view_width/map.tile_size));
    
    //console.log(`x: ${game.camera_x}, y: ${game.camera_y}\n`);
}

function render() {
    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(map_render, game.camera_x*map.tile_size, game.camera_y*map.tile_size, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height);
    draw_triangle(ctx, player.pos_x, player.pos_y, 80, -(player.angle + 90), player.color);
    ctx.restore();
}

function loop() {
    updateGame();
    render();
    window.requestAnimationFrame(loop);
}

window.requestAnimationFrame(loop);
