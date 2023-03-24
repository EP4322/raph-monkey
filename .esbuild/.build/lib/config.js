"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const skuba_dive_1 = require("skuba-dive");
const environments = ['local', 'test', 'dev', 'prod'];
const environment = skuba_dive_1.Env.oneOf(environments)('ENVIRONMENT');
const configs = {
    local: () => ({
        logLevel: 'debug',
        metrics: false,
        name: 'raph-monkey',
        version: 'local',
    }),
    test: () => ({
        ...configs.local(),
        logLevel: skuba_dive_1.Env.string('LOG_LEVEL', { default: 'silent' }),
        version: 'test',
    }),
    dev: () => ({
        ...configs.prod(),
        logLevel: 'debug',
    }),
    prod: () => ({
        logLevel: 'info',
        metrics: true,
        name: skuba_dive_1.Env.string('SERVICE'),
        version: skuba_dive_1.Env.string('VERSION'),
    }),
};
exports.config = {
    ...configs[environment](),
    environment,
};
//# sourceMappingURL=config.js.map