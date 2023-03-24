"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobScorerOutputSchema = void 0;
const zod_1 = require("zod");
const JobScorerInputSchema = zod_1.z.object({
    id: zod_1.z.string(),
    details: zod_1.z.string(),
});
exports.JobScorerOutputSchema = zod_1.z.object({
    id: zod_1.z.string(),
    score: zod_1.z.number(),
});
//# sourceMappingURL=jobScorer.js.map