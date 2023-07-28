"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sleep = exports.isExpired = exports.addSpecialTiles = exports.computeEstate = exports.idToCoords = exports.coordsToId = exports.SEPARATOR = exports.specialTiles = void 0;
const types_1 = require("./types");
const specialTiles_json_1 = __importDefault(require("./data/specialTiles.json"));
exports.specialTiles = specialTiles_json_1.default;
exports.SEPARATOR = ',';
function coordsToId(x, y) {
    return x + exports.SEPARATOR + y;
}
exports.coordsToId = coordsToId;
function idToCoords(id) {
    return id.split(exports.SEPARATOR).map((coord) => parseInt(coord, 10));
}
exports.idToCoords = idToCoords;
function computeEstate(x, y, tiles) {
    const id = coordsToId(x, y);
    const tile = tiles[id];
    if (tile && tile.type === types_1.TileType.OWNED && tile.estateId) {
        // stitch tiles together if they belong to the same estate
        const topId = coordsToId(x, y + 1);
        const leftId = coordsToId(x - 1, y);
        const topLeftId = coordsToId(x - 1, y + 1);
        const topTile = tiles[topId];
        const leftTile = tiles[leftId];
        const topLeftTile = tiles[topLeftId];
        // mutations ahead! we are mutating here because it's way faster than recreating thousands of objects
        tile.top = topTile ? topTile.estateId === tile.estateId : false;
        tile.left = leftTile ? leftTile.estateId === tile.estateId : false;
        tile.topLeft = topLeftTile ? topLeftTile.estateId === tile.estateId : false;
    }
}
exports.computeEstate = computeEstate;
// helper to convert a "special tile" into a Tile. A "special tile" is a road, a plaza or a district
function fromSpecialTile(specialTile) {
    const [x, y] = idToCoords(specialTile.id);
    const name = specialTile.name ||
        specialTile.type[0].toUpperCase() + specialTile.type.slice(1);
    return {
        ...specialTile,
        x,
        y,
        name,
        updatedAt: Date.now(),
    };
}
function addSpecialTiles(tiles) {
    for (const specialTile of Object.values(exports.specialTiles)) {
        tiles[specialTile.id] = specialTile.id in tiles
            ? tiles[specialTile.id]
            : fromSpecialTile(specialTile);
    }
    return tiles;
}
exports.addSpecialTiles = addSpecialTiles;
function isExpired(tile) {
    return tile && tile.expiresAt && tile.expiresAt <= (Date.now() / 1000);
}
exports.isExpired = isExpired;
async function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
exports.sleep = sleep;
