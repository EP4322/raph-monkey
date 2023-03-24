"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = exports.loggerContext = void 0;
const async_hooks_1 = require("async_hooks");
const logger_1 = __importDefault(require("@seek/logger"));
const config_1 = require("src/config");
exports.loggerContext = new async_hooks_1.AsyncLocalStorage();
exports.logger = (0, logger_1.default)({
    base: {
        environment: config_1.config.environment,
        version: config_1.config.version,
    },
    level: config_1.config.logLevel,
    mixin: () => ({ ...exports.loggerContext.getStore() }),
    name: config_1.config.name,
    transport: config_1.config.environment === 'local' ? { target: 'pino-pretty' } : undefined,
});
//# sourceMappingURL=logging.js.map