"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toLegacyTiles = exports.getLegacyTile = void 0;
const types_1 = require("../modules/map/types");
const ethers_1 = require("ethers");
function getLegacyTile(tile) {
    if (tile.price != null) {
        return 10;
    }
    switch (tile.type) {
        case types_1.TileType.DISTRICT:
            return 5;
        case types_1.TileType.OWNED:
            return 9;
        case types_1.TileType.UNOWNED:
            return 11;
        case types_1.TileType.PLAZA:
            return 8;
        case types_1.TileType.ROAD:
            return 7;
        default:
            return -1;
    }
}
exports.getLegacyTile = getLegacyTile;
// helpers to convert to legacy format
function toLegacyTiles(tiles) {
    const legacyTiles = {};
    for (const id in tiles) {
        legacyTiles[id] = toLegacyTile(tiles[id]);
    }
    return legacyTiles;
}
exports.toLegacyTiles = toLegacyTiles;
function toLegacyTile(tile) {
    const legacyTile = {};
    if (tile.type)
        legacyTile.type = getLegacyTile(tile);
    if ('x' in tile)
        legacyTile.x = tile.x;
    if ('y' in tile)
        legacyTile.y = tile.y;
    if (tile.top)
        legacyTile.top = 1;
    if (tile.left)
        legacyTile.left = 1;
    if (tile.topLeft)
        legacyTile.topLeft = 1;
    if (tile.owner)
        legacyTile.owner = tile.owner;
    if (tile.name)
        legacyTile.name = tile.name;
    if (tile.estateId)
        legacyTile.estate_id = tile.estateId;
    if (tile.price)
        legacyTile.price = tile.price;
    if (tile.rentalListing)
        legacyTile.rentalPricePerDay = tile.rentalListing.periods.reduce((acc, curr) => ethers_1.BigNumber.from(curr.pricePerDay).gt(acc) ? curr.pricePerDay : acc, '0');
    return legacyTile;
}
