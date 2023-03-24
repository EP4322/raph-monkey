"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scoreJobPublishedEvent = exports.scoringService = void 0;
const jobScorer_1 = require("src/mapping/jobScorer");
const jobScorer_2 = require("src/types/jobScorer");
exports.scoringService = {
    request: (details) => {
        if (Math.random() < 0.05) {
            const err = Error('could not reach scoring service');
            return Promise.reject(err);
        }
        if (details.length % 100 === 0) {
            return Promise.resolve(null);
        }
        return Promise.resolve(Math.random());
    },
    smokeTest: async () => {
        await Promise.resolve();
    },
};
const scoreJob = async ({ details, id, }) => {
    const score = await exports.scoringService.request(details);
    return jobScorer_2.JobScorerOutputSchema.parse({
        id,
        score,
    });
};
const scoreJobPublishedEvent = async (publishedJob) => {
    const scorerInput = (0, jobScorer_1.jobPublishedEventToScorerInput)(publishedJob);
    const scorerOutput = await scoreJob(scorerInput);
    return (0, jobScorer_1.jobScorerOutputToScoredEvent)(scorerOutput);
};
exports.scoreJobPublishedEvent = scoreJobPublishedEvent;
//# sourceMappingURL=jobScorer.js.map