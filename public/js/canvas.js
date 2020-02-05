function draw_triangle(context, x, y, size, angle, color) {
    const t_height = size*Math.sqrt(3)/2;
    context.save();
    context.beginPath();
    context.translate(x, y);
    context.rotate((Math.PI / 180) * angle);
    context.moveTo(0, -(2/3)*t_height);
    context.lineWidth = 14;
    context.strokeStyle = '#FFFFFF';
    context.stroke();
    context.lineTo(-size/2, (1/3)*t_height);
    context.lineTo(size/2, (1/3)*t_height);
    context.fillStyle = color;
    context.fill();
    context.closePath();
    context.restore();
}

function draw_square(context, x, y, size, angle, color) {
    context.save();
    context.translate(x, y);
    context.rotate((Math.PI / 180) * angle);
    context.fillStyle = color;
    context.fillRect(-size/2, -size/2, size, size);
    context.restore();
}

function draw_circle(context, x, y, radius, color) {
    context.save();
    context.beginPath();
    context.arc(x, y, radius, 0, 2*Math.PI)
    context.fillStyle = color;
    context.fill();
    context.closePath();
    context.restore();
}

function render_map(game) {
    const grid_width = game.map_width + 2*game.map_margin;
    const grid_height = game.map_height + 2*game.map_margin;

    const map_canvas = new OffscreenCanvas(grid_width * game.tile_size, grid_height * game.tile_size)

    for (x=0; x < grid_width; x++) {
        for (y=0; y < grid_height; y++) {
            draw_square(map_canvas.getContext('2d'), game.tile_size*(x + 0.5), game.tile_size*(y + 0.5), game.tile_size, 0, game.map[x][y].color);
        }
    }

    return map_canvas;
}

function draw_player(ctx, player, game, itself) {
    let pposx, pposy, name_x, name_y;
    if(itself) {
        pposx = game.player_screen_x;
        pposy = game.player_screen_y;
    } else {
        pposx = player.x*game.tile_size - game.camera_x;
        pposy = player.y*game.tile_size - game.camera_y;
    }

    switch(player.n_sides) {
        case 3:
            //const off_canvas = new OffscreenCanvas(player.size, player.size);
            draw_triangle(ctx, pposx, pposy, player.size, -(player.angle + 90), player.color);
            break;
    }
    ctx.font= '20px sans-serif';
    name_x = pposx - ctx.measureText(player.name).width/2;
    name_y = pposy + player.size/2 + 25;
    ctx.fillText(player.name, name_x, name_y);
}

function draw_projectile(ctx, projectile, game) {
    let pposx, pposy;

    pposx = projectile.x*game.tile_size - game.camera_x;
    pposy = projectile.y*game.tile_size - game.camera_y;

    draw_circle(ctx, pposx, pposy, projectile.radius, projectile.color);
}