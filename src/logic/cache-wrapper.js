"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cacheWrapper = void 0;
function cacheWrapper(handler, deps = []) {
    const cache = new Map();
    return async (ctx) => {
        const key = ctx.url.toString();
        const data = cache.get(key);
        const currentDeps = deps.map((dep) => dep());
        if (data) {
            const isValid = !data.deps.some((dep, i) => dep !== currentDeps[i]); // check if any of the cached deps is different to the current deps
            if (isValid) {
                return data.response;
            }
            else {
                cache.delete(key); // clean cache if invalidated
            }
        }
        const response = await handler(ctx);
        cache.set(key, {
            deps: currentDeps,
            response: response,
        });
        return response;
    };
}
exports.cacheWrapper = cacheWrapper;
