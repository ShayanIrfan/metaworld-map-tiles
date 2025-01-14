"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderMap = void 0;
const tile_1 = require("./tile");
function renderMap(args) {
    const { ctx, width, height, size, pan, nw, se, center, layers } = args;
    ctx.fillStyle = '#18141a';
    ctx.fillRect(0, 0, width, height);
    const halfWidth = width / 2;
    const halfHeight = height / 2;
    for (const layer of layers) {
        for (let x = nw.x; x < se.x; x++) {
            for (let y = se.y; y < nw.y; y++) {
                const offsetX = (center.x - x) * size + (pan ? pan.x : 0);
                const offsetY = (y - center.y) * size + (pan ? pan.y : 0);
                const tile = layer(x, y);
                if (!tile) {
                    continue;
                }
                const { color, top, left, topLeft, scale } = tile;
                const halfSize = scale ? (size * scale) / 2 : size / 2;
                (0, tile_1.renderTile)({
                    ctx,
                    x: halfWidth - offsetX + halfSize,
                    y: halfHeight - offsetY + halfSize,
                    size,
                    padding: size < 7 ? 0.5 : size < 12 ? 1 : size < 18 ? 1.5 : 2,
                    offset: 1,
                    color,
                    left,
                    top,
                    topLeft,
                    scale,
                });
            }
        }
    }
}
exports.renderMap = renderMap;
