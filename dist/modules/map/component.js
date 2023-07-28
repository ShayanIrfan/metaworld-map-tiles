"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMapComponent = void 0;
const events_1 = require("events");
const fp_future_1 = __importDefault(require("fp-future"));
const types_1 = require("./types");
const utils_1 = require("./utils");
async function createMapComponent(components) {
    const { config, api, batchApi, tracer } = components;
    // config
    const refreshInterval = (await config.requireNumber('REFRESH_INTERVAL')) * 1000;
    const landContractAddress = await config.requireString('LAND_CONTRACT_ADDRESS');
    const estateContractAddress = await config.requireString('ESTATE_CONTRACT_ADDRESS');
    // events
    const events = new events_1.EventEmitter();
    // data
    let tiles = (0, fp_future_1.default)();
    let parcels = (0, fp_future_1.default)();
    let estates = (0, fp_future_1.default)();
    let tokens = (0, fp_future_1.default)();
    let ready = false;
    let lastUpdatedAt = 0;
    // sort
    const sortByCoords = (a, b) => a.x < b.x ? -1 : a.x > b.x ? 1 : a.y > b.y ? -1 : 1; // sort from left to right, from top to bottom
    // methods
    function addTiles(newTiles, oldTiles) {
        // mutations ahead (for performance reasons)
        for (const tile of newTiles.sort(sortByCoords)) {
            oldTiles[tile.id] = tile;
            (0, utils_1.computeEstate)(tile.x, tile.y, oldTiles);
        }
        return oldTiles;
    }
    function addParcels(newParcels, oldParcels) {
        for (const parcel of newParcels) {
            const xAttr = parcel.attributes.find((attribute) => attribute.trait_type === 'X');
            const yAttr = parcel.attributes.find((attribute) => attribute.trait_type === 'Y');
            const x = xAttr ? xAttr.value : null;
            const y = yAttr ? yAttr.value : null;
            if (x !== null && y !== null) {
                const id = x + ',' + y;
                oldParcels[id] = parcel;
            }
        }
        return oldParcels;
    }
    function addEstates(newEstates, oldEstates) {
        for (const estate of newEstates) {
            oldEstates[estate.id] = estate;
        }
        return oldEstates;
    }
    function addTokens(newParcels, newEstates, oldTokens) {
        for (const parcel of newParcels) {
            oldTokens[landContractAddress + '-' + parcel.id] = parcel;
        }
        for (const estate of newEstates) {
            oldTokens[estateContractAddress + '-' + estate.id] = estate;
        }
        return oldTokens;
    }
    function expireOrders(tiles) {
        const newTiles = {};
        for (const id in tiles) {
            const tile = tiles[id];
            if ((0, utils_1.isExpired)(tile)) {
                newTiles[id] = { ...tile };
                delete newTiles[id].price;
                delete newTiles[id].expiresAt;
            }
            else {
                newTiles[id] = tile;
            }
        }
        return newTiles;
    }
    const lifeCycle = {
        // IBaseComponent.start lifecycle
        async start() {
            events.emit(types_1.MapEvents.INIT);
            try {
                const result = await batchApi.fetchData();
                lastUpdatedAt = result.updatedAt;
                tiles.resolve((0, utils_1.addSpecialTiles)(addTiles(result.tiles, {})));
                parcels.resolve(addParcels(result.parcels, {}));
                estates.resolve(addEstates(result.estates, {}));
                tokens.resolve(addTokens(result.parcels, result.estates, {}));
                ready = true;
                events.emit(types_1.MapEvents.READY, result);
                await (0, utils_1.sleep)(refreshInterval);
                poll();
            }
            catch (error) {
                tiles.reject(error);
            }
        },
    };
    const statusChecks = {
        /**
         * The first probe to run is the Startup probe.
         * When your app starts up, it might need to do a lot of work.
         * It might need to fetch data from remote services, load dlls
         * from plugins, who knows what else. During that process, your
         * app should either not respond to requests, or if it does, it
         * should return a status code of 400 or higher. Once the startup
         * process has finished, you can switch to returning a success
         * result (200) for the startup probe.
         *
         * IMPORTANT: This method should return as soon as possible, not wait for completion.
         * @public
         */
        async startupProbe() {
            return isReady();
        },
        /**
         * Readiness probes indicate whether your application is ready to
         * handle requests. It could be that your application is alive, but
         * that it just can't handle HTTP traffic. In that case, Kubernetes
         * won't kill the container, but it will stop sending it requests.
         * In practical terms, that means the pod is removed from an
         * associated service's "pool" of pods that are handling requests,
         * by marking the pod as "Unready".
         *
         * IMPORTANT: This method should return as soon as possible, not wait for completion.
         * @public
         */
        async readynessProbe() {
            return isReady();
        },
    };
    async function poll() {
        while (true) {
            await tracer.span('Polling loop', async () => {
                try {
                    const oldTiles = await tiles;
                    const oldParcels = await parcels;
                    const oldEstates = await estates;
                    const result = await api.fetchUpdatedData(lastUpdatedAt, oldTiles);
                    if (result.tiles.length > 0) {
                        // update tiles
                        const newTiles = expireOrders(addTiles(result.tiles, oldTiles));
                        tiles = (0, fp_future_1.default)();
                        tiles.resolve(newTiles);
                        // update parcels
                        const newParcels = addParcels(result.parcels, oldParcels);
                        parcels = (0, fp_future_1.default)();
                        parcels.resolve(newParcels);
                        // update estates
                        const newEstates = addEstates(result.estates, oldEstates);
                        estates = (0, fp_future_1.default)();
                        estates.resolve(newEstates);
                        // update token
                        const oldTokens = await tokens;
                        const newTokens = addTokens(result.parcels, result.estates, oldTokens);
                        tokens = (0, fp_future_1.default)();
                        tokens.resolve(newTokens);
                        // update lastUpdatedAt
                        lastUpdatedAt = result.updatedAt;
                        events.emit(types_1.MapEvents.UPDATE, result);
                    }
                }
                catch (error) {
                    events.emit(types_1.MapEvents.ERROR, error);
                }
                await (0, utils_1.sleep)(refreshInterval);
            });
        }
    }
    function getTiles() {
        return tiles;
    }
    async function getParcel(x, y) {
        const id = x + ',' + y;
        const result = (await parcels)[id];
        return result || null;
    }
    async function getEstate(id) {
        const result = (await estates)[id];
        return result || null;
    }
    async function getLastEstateId() {
        const ids = Object.values(await estates)
            .map((estate) => Number(estate.id))
            .sort((a, b) => (a > b ? 1 : -1));
        return ids.pop();
    }
    const notFoundDissolvedEstateIds = new Set();
    async function getDissolvedEstate(id) {
        // if id is not a tokenId
        if (id && !id.match(`^[0-9]+$`)) {
            return null;
        }
        // if this id has been queried already return before hitting the subgraph
        if (notFoundDissolvedEstateIds.has(id)) {
            return null;
        }
        // if id goes beyond last id in memory return before hitting the subgraph
        const lastEstateId = await getLastEstateId();
        if (Number(id) > lastEstateId) {
            return null;
        }
        // fetch dissolved estate from subgraph
        const estate = await api.getDissolvedEstate(id);
        if (estate) {
            // update estates with the dissolved estate for future requests
            const result = {
                tiles: [],
                parcels: [],
                estates: [estate],
                updatedAt: lastUpdatedAt, // we keep the lastUpdatedAt when inserting a dissolved estate since this is added on demand
            };
            const oldEstates = await estates;
            const newEstates = addEstates(result.estates, oldEstates);
            estates = (0, fp_future_1.default)();
            estates.resolve(newEstates);
            events.emit(types_1.MapEvents.UPDATE, result);
        }
        else {
            // keep track of ids that don't exist
            notFoundDissolvedEstateIds.add(id);
        }
        return estate;
    }
    async function getToken(contractAddress, tokenId) {
        const id = contractAddress + '-' + tokenId;
        const result = (await tokens)[id];
        return result || null;
    }
    function isReady() {
        return ready;
    }
    function getLastUpdatedAt() {
        return lastUpdatedAt;
    }
    return {
        ...lifeCycle,
        ...statusChecks,
        events,
        getTiles,
        getParcel,
        getEstate,
        getDissolvedEstate,
        getToken,
        isReady,
        getLastUpdatedAt,
    };
}
exports.createMapComponent = createMapComponent;
