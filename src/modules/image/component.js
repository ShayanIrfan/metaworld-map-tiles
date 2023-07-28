"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createImageComponent = void 0;
const canvas_1 = require("canvas");
const render_1 = require("../render");
const types_1 = require("../map/types");
const utils_1 = require("../map/utils");
const rental_1 = require("../../logic/rental");
function createImageComponent(components) {
    const { map } = components;
    function getColor(tile) {
        switch (tile.type) {
            case types_1.TileType.DISTRICT:
                return '#870020';
            case types_1.TileType.PLAZA:
                return '#ac707f';
            case types_1.TileType.ROAD:
                return '#716C7A';
            case types_1.TileType.OWNED:
                return '#3D3A46';
            case types_1.TileType.UNOWNED:
                return '#09080A';
        }
    }
    async function getStream(width, height, size, center, selected, showOnSale, showOnRent) {
        const pan = { x: 0, y: 0 };
        const { nw, se } = (0, render_1.getViewport)({ width, height, center, size, padding: 1 });
        const canvas = (0, canvas_1.createCanvas)(width, height);
        const ctx = canvas.getContext('2d');
        const tiles = await map.getTiles();
        const layer = (x, y) => {
            const id = (0, utils_1.coordsToId)(x, y);
            const tile = tiles[id];
            const isOnSale = showOnSale && tile.price && !(0, utils_1.isExpired)(tile);
            const isListedForRent = showOnRent && tile.rentalListing && !(0, rental_1.isExpired)(tile.rentalListing);
            const result = tile
                ? {
                    color: isOnSale || isListedForRent ? '#1FBCFF' : getColor(tile),
                    top: tile.top,
                    left: tile.left,
                    topLeft: tile.topLeft,
                }
                : {
                    color: (x + y) % 2 === 0 ? '#110e13' : '#0d0b0e',
                };
            return result;
        };
        const layers = [layer];
        // render selected tiles
        if (selected.length > 0) {
            const selection = new Set(selected.map((coords) => (0, utils_1.coordsToId)(coords.x, coords.y)));
            const strokeLayer = (x, y) => selection.has((0, utils_1.coordsToId)(x, y))
                ? { color: '#ff0044', scale: 1.4 }
                : null;
            const fillLayer = (x, y) => selection.has((0, utils_1.coordsToId)(x, y))
                ? { color: '#ff9990', scale: 1.2 }
                : null;
            layers.push(strokeLayer);
            layers.push(fillLayer);
        }
        (0, render_1.renderMap)({
            ctx,
            width,
            height,
            size,
            pan,
            center,
            nw,
            se,
            layers,
        });
        return canvas.createPNGStream();
    }
    return {
        getStream,
    };
}
exports.createImageComponent = createImageComponent;
