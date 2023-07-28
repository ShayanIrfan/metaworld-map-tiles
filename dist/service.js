"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.main = void 0;
const logs_1 = require("./controllers/logs");
const routes_1 = require("./controllers/routes");
// this function wires the business logic (adapters & controllers) with the components (ports)
async function main(components) {
    const globalContext = {
        components,
    };
    // wire the HTTP router (make it automatic? TBD)
    const router = await (0, routes_1.setupRouter)(components);
    components.server.use(router.middleware());
    components.server.setContext(globalContext);
    (0, logs_1.setupLogs)(components);
}
exports.main = main;
