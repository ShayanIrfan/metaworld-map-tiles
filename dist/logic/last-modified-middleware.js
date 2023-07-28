"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.lastModifiedMiddleware = void 0;
const THREE_MINUTES = 180;
const TWO_MINUTES = 120;
function lastModifiedMiddleware(getLastModifiedTime, options = {
    maxAge: TWO_MINUTES,
    staleWhileRevalidate: THREE_MINUTES,
}) {
    const cacheControlHeader = `max-age=${options.maxAge}, stale-while-revalidate=${options.staleWhileRevalidate}, public`;
    return async (context, next) => {
        const lastModifiedTime = getLastModifiedTime();
        const lastModifiedHeader = new Date(lastModifiedTime).toUTCString();
        const ifModifiedSinceHeader = context.request.headers.get('If-Modified-Since');
        if (ifModifiedSinceHeader) {
            const ifModifiedSinceTime = Date.parse(ifModifiedSinceHeader);
            if (!isNaN(ifModifiedSinceTime) &&
                lastModifiedTime <= ifModifiedSinceTime) {
                return {
                    status: 304,
                    headers: {
                        'Last-Modified': lastModifiedHeader,
                        'Cache-Control': cacheControlHeader,
                    },
                };
            }
        }
        const response = await next();
        response.headers = {
            ...response.headers,
            'Last-Modified': lastModifiedHeader,
            'Cache-Control': cacheControlHeader,
        };
        return response;
    };
}
exports.lastModifiedMiddleware = lastModifiedMiddleware;
