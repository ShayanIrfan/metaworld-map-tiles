"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const interfaces_1 = require("@well-known-components/interfaces");
const components_1 = require("./components");
const service_1 = require("./service");
// This file is the program entry point, it only calls the Lifecycle function
interfaces_1.Lifecycle.programEntryPoint({ main: service_1.main, initComponents: components_1.initComponents });
