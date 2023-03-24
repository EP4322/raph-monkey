"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jobScorerOutputToScoredEvent = exports.jobPublishedEventToScorerInput = void 0;
const jobPublishedEventToScorerInput = (record) => ({
    details: record.data.details,
    id: record.entityId,
});
exports.jobPublishedEventToScorerInput = jobPublishedEventToScorerInput;
const jobScorerOutputToScoredEvent = (output) => ({
    data: {
        score: output.score,
    },
    entityId: output.id,
    eventType: 'JobScored',
});
exports.jobScorerOutputToScoredEvent = jobScorerOutputToScoredEvent;
//# sourceMappingURL=jobScorer.js.map