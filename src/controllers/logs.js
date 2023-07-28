"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupLogs = void 0;
const cli_progress_1 = require("cli-progress");
const types_1 = require("../modules/api/types");
const types_2 = require("../modules/map/types");
const setupLogs = (components) => {
    const { config, map, batchApi } = components;
    const bar = new cli_progress_1.SingleBar({ format: '[{bar}] {percentage}%' });
    map.events.on(types_2.MapEvents.INIT, async () => {
        console.log(`Fetching data...`);
        // TODO: it may be better to ask configurations to the specific component like
        //     console.log(`URL: ${map.SUBGRAPH_URL}`)
        // to avoid using config with hardcoded keys everywhere
        console.log(`Graph URL: ${await config.getString('SUBGRAPH_URL')}`);
        console.log(`Signatures server URL: ${await config.getString('SIGNATURES_SERVER_URL')}`);
        console.log(`Concurrency: ${await config.getString('API_CONCURRENCY')}`);
        console.log(`Batch Size: ${await config.getString('API_BATCH_SIZE')}`);
        bar.start(100, 0);
    });
    batchApi.events.on(types_1.ApiEvents.PROGRESS, (progress) => bar.update(progress));
    map.events.on(types_2.MapEvents.READY, async (result) => {
        bar.stop();
        console.log(`Total: ${result.tiles.length.toLocaleString()} tiles`);
        console.log(`Parcels: ${result.parcels.length.toLocaleString()}`);
        console.log(`Estates: ${result.estates.length.toLocaleString()}`);
        console.log(`Last timestamp:`, result.updatedAt);
        console.log(`Polling changes every ${await config.getNumber('REFRESH_INTERVAL')} seconds`);
    });
    map.events.on(types_2.MapEvents.UPDATE, (result) => {
        console.log(`Updating ${result.tiles.length} tiles: ${result.tiles
            .map((tile) => `${tile.x},${tile.y}`)
            .join(', ')}`);
        console.log(`Updating ${result.parcels.length} parcels`);
        console.log(`Updating ${result.estates.length} estates`);
        console.log(`Last timestamp:`, result.updatedAt);
    });
    map.events.on(types_2.MapEvents.ERROR, (error) => {
        console.log(`Error: updating tiles
       ${error.message}
       ${error.stack}`);
    });
};
exports.setupLogs = setupLogs;
