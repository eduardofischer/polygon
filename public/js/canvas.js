function draw_triangle(context, x, y, size, angle, color) {
    const t_height = size*Math.sqrt(3)/2;
    context.save();
    context.beginPath();
    context.translate(x, y);
    context.rotate((Math.PI / 180) * angle);
    context.moveTo(0, -(2/3)*t_height);
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

function draw_map() {
    const map_canvas = document.createElement('canvas');
    map_canvas.width = (map.width + 2*map.margin_space) * map.tile_size;
    map_canvas.height = (map.height + 2*map.margin_space) * map.tile_size;
    map_ctx = map_canvas.getContext('2d');

    for (x=0; x < grid_width; x++) {
        for (y=0; y < grid_height; y++) {
            draw_square(map_ctx, map.tile_size*(x + 0.5), map.tile_size*(y + 0.5), map.tile_size, 0, map.grid[x][y].color);
        }
    }

    return map_canvas;
}