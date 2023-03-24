"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateJson = void 0;
const validateJson = (input, schema) => schema.parse(JSON.parse(input));
exports.validateJson = validateJson;
//# sourceMappingURL=validation.js.map