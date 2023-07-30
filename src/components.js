'use strict'
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k
        var desc = Object.getOwnPropertyDescriptor(m, k)
        if (
          !desc ||
          ('get' in desc ? !m.__esModule : desc.writable || desc.configurable)
        ) {
          desc = {
            enumerable: true,
            get: function () {
              return m[k]
            },
          }
        }
        Object.defineProperty(o, k2, desc)
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k
        o[k2] = m[k]
      })
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? function (o, v) {
        Object.defineProperty(o, 'default', { enumerable: true, value: v })
      }
    : function (o, v) {
        o['default'] = v
      })
var __importStar =
  (this && this.__importStar) ||
  function (mod) {
    if (mod && mod.__esModule) return mod
    var result = {}
    if (mod != null)
      for (var k in mod)
        if (k !== 'default' && Object.prototype.hasOwnProperty.call(mod, k))
          __createBinding(result, mod, k)
    __setModuleDefault(result, mod)
    return result
  }
Object.defineProperty(exports, '__esModule', { value: true })
exports.initComponents = void 0
const nodeFetch = __importStar(require('node-fetch'))
const env_config_provider_1 = require('@well-known-components/env-config-provider')
const metrics_1 = require('@well-known-components/metrics')
const http_server_1 = require('@well-known-components/http-server')
const thegraph_component_1 = require('@well-known-components/thegraph-component')
const logger_1 = require('@well-known-components/logger')
const tracer_component_1 = require('@well-known-components/tracer-component')
const http_tracer_component_1 = require('@well-known-components/http-tracer-component')
const http_requests_logger_component_1 = require('@well-known-components/http-requests-logger-component')
const component_1 = require('./modules/api/component')
const component_2 = require('./modules/district/component')
const component_3 = require('./modules/image/component')
const component_4 = require('./modules/map/component')
const component_5 = require('./modules/rentals/component')
const metrics_2 = require('./metrics')
const mini_map_renderer_1 = require('./adapters/mini-map-renderer')
const fs = require('fs')

async function initComponents() {
  async function setEnvVariable(key, value) {
    // Load the current .env file content
    const envFilePath = '.env.defaults'
    let envFileContent = fs.readFileSync(envFilePath, 'utf8')

    // Check if the variable already exists in the file
    const envVariableRegex = new RegExp(`${key}=.*`, 'g')
    if (envVariableRegex.test(envFileContent)) {
      // If the variable exists, update its value
      envFileContent = envFileContent.replace(
        envVariableRegex,
        `${key}=${value}`
      )
    } else {
      // If the variable does not exist, add it to the end of the file
      envFileContent += `\n${key}=${value}`
    }

    // Write the updated content back to the .env file
    fs.writeFileSync(envFilePath, envFileContent, 'utf8')
  }

  await setEnvVariable('HTTP_SERVER_PORT', process.env.PORT || 80)

  const config = await (0, env_config_provider_1.createDotEnvConfigComponent)(
    { path: ['.env.defaults', '.env'] },
    process.env
  )

  const cors = {
    origin: await config.getString('CORS_ORIGIN'),
    method: await config.getString('CORS_METHOD'),
  }
  const subgraphURL = await config.requireString('SUBGRAPH_URL')
  const fetch = {
    fetch: (url, init) => {
      const headers = { ...init?.headers }
      const traceParent = tracer.isInsideOfTraceSpan()
        ? tracer.getTraceChildString()
        : null
      if (traceParent) {
        headers.traceparent = traceParent
        const traceState = tracer.getTraceStateString()
        if (traceState) {
          headers.tracestate = traceState
        }
      }
      return nodeFetch.default(url, { ...init, headers })
    },
  }
  const metrics = await (0, metrics_1.createMetricsComponent)(
    metrics_2.metricDeclarations,
    {
      config,
    }
  )
  const tracer = (0, tracer_component_1.createTracerComponent)()
  const logs = await (0, logger_1.createLogComponent)({ metrics, tracer })
  const batchLogs = {
    getLogger(name) {
      const logger = logs.getLogger(name)
      // We don't want to show info for each batched subgraph query
      return { ...logger, info: () => {} }
    },
  }
  const server = await (0, http_server_1.createServerComponent)(
    { config, logs },
    { cors }
  )
  ;(0, http_tracer_component_1.createHttpTracerComponent)({ server, tracer })
  ;(0, http_requests_logger_component_1.instrumentHttpServerWithRequestLogger)({
    server,
    logger: logs,
  })
  await (0, metrics_1.instrumentHttpServerWithMetrics)({
    metrics,
    server,
    config,
  })
  const subgraph = await (0, thegraph_component_1.createSubgraphComponent)(
    { config, logs, fetch, metrics },
    subgraphURL
  )
  const batchSubgraph = await (0, thegraph_component_1.createSubgraphComponent)(
    { config, logs: batchLogs, fetch, metrics },
    subgraphURL
  )
  const rentals = await (0, component_5.createRentalsComponent)({
    config,
    fetch,
    logger: logs,
  })
  const api = await (0, component_1.createApiComponent)({
    config,
    subgraph,
    rentals,
    logger: logs,
    metrics,
  })
  const batchApi = await (0, component_1.createApiComponent)({
    config,
    subgraph: batchSubgraph,
    rentals,
    logger: logs,
    metrics,
  })
  const map = await (0, component_4.createMapComponent)({
    config,
    api,
    batchApi,
    tracer,
  })
  const image = (0, component_3.createImageComponent)({ map })
  const district = (0, component_2.createDistrictComponent)()
  const statusChecks = await (0, http_server_1.createStatusCheckComponent)({
    server,
    config,
  })
  const renderMiniMap = await (0,
  mini_map_renderer_1.createMiniMapRendererComponent)({ map })
  const renderEstateMiniMap = await (0,
  mini_map_renderer_1.createEstatesRendererComponent)({ map })
  return {
    config,
    api,
    batchApi,
    subgraph,
    map,
    metrics,
    server,
    logs,
    image,
    district,
    statusChecks,
    renderMiniMap,
    renderEstateMiniMap,
  }
}

exports.initComponents = initComponents
