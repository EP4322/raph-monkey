"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createHandler = void 0;
const logging_1 = require("src/framework/logging");
const withDatadog = (fn) => fn;
const createHandler = (fn) => withDatadog((event, { awsRequestId }) => logging_1.loggerContext.run({ awsRequestId }, async () => {
    try {
        const output = await fn(event);
        logging_1.logger.info('Function succeeded');
        return output;
    }
    catch (err) {
        logging_1.logger.error({ err }, 'Function failed');
        throw new Error('Function failed');
    }
}));
exports.createHandler = createHandler;
//# sourceMappingURL=handler.js.map