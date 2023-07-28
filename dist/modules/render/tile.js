"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderTile = void 0;
function renderTile(args) {
    const { ctx, x, y, size, padding, offset, color, left, top, topLeft, scale } = args;
    ctx.fillStyle = color;
    const tileSize = scale ? size * scale : size;
    if (!top && !left) {
        // disconnected everywhere: it's a square
        ctx.fillRect(x - tileSize + padding, y - tileSize + padding, tileSize - padding, tileSize - padding);
    }
    else if (top && left && topLeft) {
        // connected everywhere: it's a square
        ctx.fillRect(x - tileSize - offset, y - tileSize - offset, tileSize + offset, tileSize + offset);
    }
    else {
        if (left) {
            // connected left: it's a rectangle
            ctx.fillRect(x - tileSize - offset, y - tileSize + padding, tileSize + offset, tileSize - padding);
        }
        if (top) {
            // connected top: it's a rectangle
            ctx.fillRect(x - tileSize + padding, y - tileSize - offset, tileSize - padding, tileSize + offset);
        }
    }
}
exports.renderTile = renderTile;
