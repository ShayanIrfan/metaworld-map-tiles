"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupRouter = void 0;
const last_modified_middleware_1 = require("../logic/last-modified-middleware");
const handlers_1 = require("./handlers");
const http_server_1 = require("@well-known-components/http-server");
// We return the entire router because it will be easier to test than a whole server
async function setupRouter(components) {
    const router = new http_server_1.Router();
    const { district, map } = components;
    const getLastModifiedTime = () => map.getLastUpdatedAt() * 1000;
    const lastModifiedMiddlewareByMapDate = (0, last_modified_middleware_1.lastModifiedMiddleware)(getLastModifiedTime);
    router.get('/v1/tiles', lastModifiedMiddlewareByMapDate, (0, handlers_1.createLegacyTilesRequestHandler)(components));
    router.get('/v2/tiles', lastModifiedMiddlewareByMapDate, (0, handlers_1.createTilesRequestHandler)(components));
    router.get('/v2/tiles/info', handlers_1.tilesInfoRequestHandler);
    router.get('/v1/map.png', lastModifiedMiddlewareByMapDate, handlers_1.mapPngRequestHandler);
    router.get('/v1/minimap.png', (0, last_modified_middleware_1.lastModifiedMiddleware)(getLastModifiedTime, {
        maxAge: 600,
        staleWhileRevalidate: 600,
    }), handlers_1.miniMapHandler);
    router.get('/v1/estatemap.png', (0, last_modified_middleware_1.lastModifiedMiddleware)(getLastModifiedTime, {
        maxAge: 600,
        staleWhileRevalidate: 600,
    }), handlers_1.estateMapHandler);
    router.get('/v1/parcels/:x/:y/map.png', lastModifiedMiddlewareByMapDate, handlers_1.parcelMapPngRequestHandler);
    router.get('/v1/estates/:estateId/map.png', lastModifiedMiddlewareByMapDate, handlers_1.estateMapPngRequestHandler);
    router.get('/v2/map.png', lastModifiedMiddlewareByMapDate, handlers_1.mapPngRequestHandler);
    router.get('/v2/parcels/:x/:y/map.png', lastModifiedMiddlewareByMapDate, handlers_1.parcelMapPngRequestHandler);
    router.get('/v2/estates/:estateId/map.png', lastModifiedMiddlewareByMapDate, handlers_1.estateMapPngRequestHandler);
    router.get('/v2/ping', handlers_1.pingRequestHandler);
    router.get('/v2/ready', handlers_1.readyRequestHandler);
    router.get('/v2/parcels/:x/:y', lastModifiedMiddlewareByMapDate, handlers_1.parcelRequestHandler);
    router.get('/v2/estates/:id', lastModifiedMiddlewareByMapDate, handlers_1.estateRequestHandler);
    router.get('/v2/contracts/:address/tokens/:id', lastModifiedMiddlewareByMapDate, handlers_1.tokenRequestHandler);
    router.get('/v2/districts', lastModifiedMiddlewareByMapDate, async () => ({
        status: 200,
        body: { ok: true, data: district.getDistricts() },
    }));
    router.get('/v2/districts/:id', lastModifiedMiddlewareByMapDate, async (req) => {
        const result = district.getDistrict(req.params.id);
        if (result) {
            return {
                status: 200,
                body: { ok: true, data: result },
            };
        }
        else {
            return {
                status: 404,
                body: 'Not found',
            };
        }
    });
    router.get('/v2/addresses/:address/contributions', lastModifiedMiddlewareByMapDate, async (req) => ({
        status: 200,
        body: {
            ok: true,
            data: district.getContributionsByAddress(req.params.address),
        },
    }));
    return router;
}
exports.setupRouter = setupRouter;
