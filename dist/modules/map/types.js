"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tileFields = exports.TileType = exports.MapEvents = void 0;
var MapEvents;
(function (MapEvents) {
    MapEvents["INIT"] = "init";
    MapEvents["READY"] = "ready";
    MapEvents["UPDATE"] = "update";
    MapEvents["ERROR"] = "error";
})(MapEvents = exports.MapEvents || (exports.MapEvents = {}));
var TileType;
(function (TileType) {
    TileType["OWNED"] = "owned";
    TileType["UNOWNED"] = "unowned";
    TileType["PLAZA"] = "plaza";
    TileType["ROAD"] = "road";
    TileType["DISTRICT"] = "district";
})(TileType = exports.TileType || (exports.TileType = {}));
exports.tileFields = [
    'id',
    'x',
    'y',
    'type',
    'name',
    'top',
    'left',
    'topLeft',
    'updatedAt',
    'owner',
    'estateId',
    'tokenId',
    'price',
    'expiresAt',
];
