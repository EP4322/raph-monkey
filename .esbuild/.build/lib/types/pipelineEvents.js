"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobScoredEventSchema = exports.JobPublishedEventSchema = void 0;
const zod_1 = require("zod");
exports.JobPublishedEventSchema = zod_1.z.object({
    data: zod_1.z.object({
        details: zod_1.z.string(),
    }),
    entityId: zod_1.z.string(),
    eventType: zod_1.z.literal('JobPublished'),
});
exports.JobScoredEventSchema = zod_1.z.object({
    data: zod_1.z.object({
        score: zod_1.z.number(),
    }),
    entityId: zod_1.z.string(),
    eventType: zod_1.z.literal('JobScored'),
});
//# sourceMappingURL=pipelineEvents.js.map