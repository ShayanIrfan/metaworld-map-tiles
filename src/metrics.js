"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.metricDeclarations = void 0;
const interfaces_1 = require("@well-known-components/interfaces");
const metrics_1 = require("@well-known-components/metrics");
const thegraph_component_1 = require("@well-known-components/thegraph-component");
const logger_1 = require("@well-known-components/logger");
exports.metricDeclarations = {
    ...(0, metrics_1.getDefaultHttpMetrics)(),
    ...logger_1.metricDeclarations,
    ...thegraph_component_1.metricDeclarations,
    dcl_map_render_time: {
        help: 'map render time',
        buckets: [0.1, 5, 15, 50, 100, 500],
        type: interfaces_1.IMetricsComponent.HistogramType,
        labelNames: ['status'],
    },
    dcl_mini_map_render_time: {
        help: 'map render time',
        buckets: [0.1, 5, 15, 50, 100, 500],
        type: interfaces_1.IMetricsComponent.HistogramType,
        labelNames: ['status'],
    },
    dcl_map_update: {
        type: interfaces_1.IMetricsComponent.CounterType,
        help: 'Updates',
        labelNames: ['type', 'status'],
    },
};
// type assertions
(0, metrics_1.validateMetricsDeclaration)(exports.metricDeclarations);
