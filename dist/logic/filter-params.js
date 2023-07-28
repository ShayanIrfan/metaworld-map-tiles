"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractParams = exports.getFilterFromUrl = void 0;
const types_1 = require("../modules/map/types");
const validFields = new Set(types_1.tileFields);
function getFilterFromUrl(url, tiles) {
    let result = tiles;
    // filter by coords
    const x1 = url.searchParams.get('x1');
    const x2 = url.searchParams.get('x2');
    const y1 = url.searchParams.get('y1');
    const y2 = url.searchParams.get('y2');
    const include = url.searchParams.get('include');
    const exclude = url.searchParams.get('exclude');
    if (x1 &&
        x2 &&
        y1 &&
        y2 &&
        !isNaN(+x1) &&
        !isNaN(+x2) &&
        !isNaN(+y1) &&
        !isNaN(+y2)) {
        const minX = Math.min(+x1, +x2);
        const maxX = Math.max(+x1, +x2);
        const minY = Math.min(+y1, +y2);
        const maxY = Math.max(+y1, +y2);
        result = {};
        for (const tile of Object.values(tiles)) {
            if (tile.x >= minX &&
                tile.x <= maxX &&
                tile.y >= minY &&
                tile.y <= maxY) {
                result[tile.id] = tile;
            }
        }
    }
    // include fields
    if (include) {
        const fieldsToInclude = include
            .split(',')
            .filter((field) => validFields.has(field));
        result = Object.keys(result).reduce((newResult, id) => {
            const tile = result[id];
            const newTile = {};
            for (const field of fieldsToInclude) {
                // @ts-ignore
                newTile[field] = tile[field];
            }
            newResult[id] = newTile;
            return newResult;
        }, {});
    }
    else if (exclude && result.length > 0) {
        const fieldsToExclude = exclude.split(',');
        const fieldsInclude = Array.from(validFields).filter((field) => !fieldsToExclude.includes(field));
        result = Object.keys(result).reduce((newResult, id) => {
            const tile = result[id];
            const newTile = {};
            for (const field of fieldsInclude) {
                // @ts-ignore
                newTile[field] = tile[field];
            }
            newResult[id] = newTile;
            return newResult;
        }, {});
    }
    return result;
}
exports.getFilterFromUrl = getFilterFromUrl;
function extractParams(url) {
    const parse = (name, defaultValue, minValue, maxValue) => Math.max(Math.min(url.searchParams.has(name) &&
        !isNaN(parseInt(url.searchParams.get(name)))
        ? parseInt(url.searchParams.get(name))
        : defaultValue, maxValue), minValue);
    // params
    const width = parse('width', 1024, 100, 4096);
    const height = parse('height', 1024, 100, 4096);
    const size = parse('size', 20, 5, 50);
    const [x, y] = url.searchParams.has('center')
        ? url.searchParams.get('center')
            .split(',')
            .map((coord) => +coord)
        : [0, 0];
    const center = { x, y };
    const showOnSale = url.searchParams.get('on-sale') === 'true';
    const showListedForRent = url.searchParams.get('listed-for-rent') === 'true';
    const selected = url.searchParams.has('selected')
        ? url.searchParams.get('selected').split(';').map((id) => {
            const [x, y] = id.split(',').map((coord) => parseInt(coord));
            return { x, y };
        })
        : [];
    return {
        width,
        height,
        size,
        center,
        showOnSale,
        showListedForRent,
        selected,
    };
}
exports.extractParams = extractParams;
