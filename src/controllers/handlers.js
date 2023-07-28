"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tilesInfoRequestHandler = exports.readyRequestHandler = exports.pingRequestHandler = exports.tokenRequestHandler = exports.estateRequestHandler = exports.parcelRequestHandler = exports.estateMapPngRequestHandler = exports.parcelMapPngRequestHandler = exports.mapPngRequestHandler = exports.estateMapHandler = exports.miniMapHandler = exports.createLegacyTilesRequestHandler = exports.createTilesRequestHandler = void 0;
const legacy_tiles_1 = require("../adapters/legacy-tiles");
const cache_wrapper_1 = require("../logic/cache-wrapper");
const filter_params_1 = require("../logic/filter-params");
const error_1 = require("../logic/error");
const createTilesRequestHandler = (components) => {
    const { map } = components;
    return (0, cache_wrapper_1.cacheWrapper)(async (context) => {
        if (!map.isReady()) {
            return { status: 503, body: 'Not ready' };
        }
        const tiles = await map.getTiles();
        const data = (0, filter_params_1.getFilterFromUrl)(context.url, tiles);
        return {
            status: 200,
            headers: {
                'content-type': 'application/json',
            },
            body: JSON.stringify({ ok: true, data }),
        };
    }, [map.getLastUpdatedAt]);
};
exports.createTilesRequestHandler = createTilesRequestHandler;
const createLegacyTilesRequestHandler = (components) => {
    const { map } = components;
    return (0, cache_wrapper_1.cacheWrapper)(async (context) => {
        if (!map.isReady()) {
            return { status: 503, body: 'Not ready' };
        }
        const tiles = await map.getTiles();
        const data = (0, legacy_tiles_1.toLegacyTiles)((0, filter_params_1.getFilterFromUrl)(context.url, tiles));
        return {
            status: 200,
            headers: {
                'content-type': 'application/json',
            },
            body: JSON.stringify({ ok: true, data }),
        };
    }, [map.getLastUpdatedAt]);
};
exports.createLegacyTilesRequestHandler = createLegacyTilesRequestHandler;
async function miniMapHandler(context) {
    const { renderMiniMap, map, metrics } = context.components;
    const timer = metrics.startTimer('dcl_mini_map_render_time');
    try {
        if (!map.isReady()) {
            return { status: 503, body: 'Not ready' };
        }
        const stream = await renderMiniMap.getStream();
        timer.end({ status: 200 });
        return {
            status: 200,
            headers: {
                'content-type': 'image/png',
            },
            body: stream,
        };
    }
    catch (error) {
        timer.end({ status: 500 });
        return {
            status: 500,
            body: {
                ok: false,
                error: (0, error_1.isErrorWithMessage)(error) ? error.message : 'Unknown error',
            },
        };
    }
}
exports.miniMapHandler = miniMapHandler;
async function estateMapHandler(context) {
    const { renderEstateMiniMap, map, metrics } = context.components;
    const timer = metrics.startTimer('dcl_mini_map_render_time');
    try {
        if (!map.isReady()) {
            return { status: 503, body: 'Not ready' };
        }
        const stream = await renderEstateMiniMap.getStream();
        timer.end({ status: 200 });
        return {
            status: 200,
            headers: {
                'content-type': 'image/png',
            },
            body: stream,
        };
    }
    catch (error) {
        timer.end({ status: 500 });
        return {
            status: 500,
            body: {
                ok: false,
                error: (0, error_1.isErrorWithMessage)(error) ? error.message : 'Unknown error',
            },
        };
    }
}
exports.estateMapHandler = estateMapHandler;
const mapPngRequestHandler = async (context) => {
    const { image, map, metrics } = context.components;
    const timer = metrics.startTimer('dcl_map_render_time');
    try {
        if (!map.isReady()) {
            return { status: 503, body: 'Not ready' };
        }
        const { width, height, size, center, showOnSale, showListedForRent, selected, } = (0, filter_params_1.extractParams)(context.url);
        const stream = await image.getStream(width, height, size, center, selected, showOnSale, showListedForRent);
        timer.end({ status: 200 });
        return {
            status: 200,
            headers: {
                'content-type': 'image/png',
            },
            body: stream,
        };
    }
    catch (error) {
        timer.end({ status: 500 });
        return {
            status: 500,
            body: {
                ok: false,
                error: (0, error_1.isErrorWithMessage)(error) ? error.message : 'Unknown error',
            },
        };
    }
};
exports.mapPngRequestHandler = mapPngRequestHandler;
const parcelMapPngRequestHandler = async (context) => {
    const { components, params } = context;
    const { image, map } = components;
    try {
        if (!map.isReady()) {
            return { status: 503, body: 'Not ready' };
        }
        const { width, height, size, showOnSale, showListedForRent } = (0, filter_params_1.extractParams)(context.url);
        const center = {
            x: parseInt(params.x) || 0,
            y: parseInt(params.y) || 0,
        };
        const selected = [center];
        const stream = await image.getStream(width, height, size, center, selected, showOnSale, showListedForRent);
        return {
            status: 200,
            headers: {
                'content-type': 'image/png',
            },
            body: stream,
        };
    }
    catch (error) {
        return {
            status: 500,
            body: {
                ok: false,
                error: (0, error_1.isErrorWithMessage)(error) ? error.message : 'Unknown error',
            },
        };
    }
};
exports.parcelMapPngRequestHandler = parcelMapPngRequestHandler;
const estateMapPngRequestHandler = async (context) => {
    const { image, map } = context.components;
    try {
        if (!map.isReady()) {
            return { status: 503, body: 'Not ready' };
        }
        const { width, height, size, showOnSale, showListedForRent } = (0, filter_params_1.extractParams)(context.url);
        const { estateId } = context.params;
        const tiles = await map.getTiles();
        const selected = Object.values(tiles).filter((tile) => tile.estateId && tile.estateId === estateId);
        if (selected.length === 0) {
            const headers = {
                location: 'https://ui.decentraland.org/dissolved_estate.png',
            };
            return {
                status: 302,
                headers,
            };
        }
        const xs = selected.map((coords) => coords.x).sort();
        const ys = selected.map((coords) => coords.y).sort();
        const x = xs[(xs.length / 2) | 0] || 0;
        const y = ys[(ys.length / 2) | 0] || 0;
        const center = { x, y };
        const stream = await image.getStream(width, height, size, center, selected, showOnSale, showListedForRent);
        return {
            status: 200,
            headers: {
                'content-type': 'image/png',
            },
            body: stream,
        };
    }
    catch (error) {
        return {
            status: 500,
            body: {
                ok: false,
                error: (0, error_1.isErrorWithMessage)(error) ? error.message : 'Unknown error',
            },
        };
    }
};
exports.estateMapPngRequestHandler = estateMapPngRequestHandler;
const parcelRequestHandler = async (context) => {
    const { map } = context.components;
    const { x, y } = context.params;
    if (!map.isReady()) {
        return { status: 503, body: 'Not ready' };
    }
    const parsedCoords = [parseInt(x), parseInt(y)];
    if (isNaN(parsedCoords[0]) || isNaN(parsedCoords[1])) {
        return { status: 403, body: 'Invalid x or y' };
    }
    const parcel = await map.getParcel(x, y);
    if (parcel) {
        return { status: 200, body: parcel };
    }
    else {
        return { status: 404, body: { ok: false, error: 'Not Found' } };
    }
};
exports.parcelRequestHandler = parcelRequestHandler;
const estateRequestHandler = async (context) => {
    const { map } = context.components;
    const { id } = context.params;
    if (!map.isReady()) {
        return { status: 503, body: 'Not ready' };
    }
    const parsedId = parseInt(id);
    if (isNaN(parsedId)) {
        return { status: 403, body: 'Invalid id' };
    }
    const estate = await map.getEstate(id);
    if (estate) {
        return { status: 200, body: estate };
    }
    else {
        const dissolvedEstate = await map.getDissolvedEstate(id);
        if (dissolvedEstate) {
            return { status: 200, body: dissolvedEstate };
        }
        else {
            return { status: 404, body: { ok: false, error: 'Not Found' } };
        }
    }
};
exports.estateRequestHandler = estateRequestHandler;
const tokenRequestHandler = async (context) => {
    const { map, config } = context.components;
    const { address, id } = context.params;
    if (!map.isReady()) {
        return { status: 503, body: 'Not ready' };
    }
    const token = await map.getToken(address, id);
    if (token) {
        const headers = {};
        const landContractAddress = await config.requireString('LAND_CONTRACT_ADDRESS');
        if (address === landContractAddress) {
            headers['cache-control'] = 'public, max-age=3600,s-maxage=3600, immutable';
        }
        return { status: 200, headers, body: token };
    }
    else {
        const estateContractAddress = await config.requireString('ESTATE_CONTRACT_ADDRESS');
        if (address === estateContractAddress) {
            const dissolvedEstate = await map.getDissolvedEstate(id);
            if (dissolvedEstate) {
                return { status: 200, body: dissolvedEstate };
            }
        }
        return { status: 404, body: { ok: false, error: 'Not Found' } };
    }
};
exports.tokenRequestHandler = tokenRequestHandler;
async function pingRequestHandler() {
    return {
        status: 200,
        body: 'ok',
    };
}
exports.pingRequestHandler = pingRequestHandler;
async function readyRequestHandler(context) {
    const { map } = context.components;
    if (!map.isReady()) {
        return { status: 503, body: 'Not ready' };
    }
    return {
        status: 200,
        body: 'ok',
    };
}
exports.readyRequestHandler = readyRequestHandler;
async function tilesInfoRequestHandler(context) {
    const { map } = context.components;
    if (!map.isReady()) {
        return { status: 503, body: 'Not ready' };
    }
    const lastUpdatedAt = map.getLastUpdatedAt();
    return {
        status: 200,
        body: { lastUpdatedAt },
    };
}
exports.tilesInfoRequestHandler = tilesInfoRequestHandler;
