import 'skuba-dive/register';

import { APIGatewayProxyEventV2 } from 'aws-lambda';

import { createHandler } from 'src/framework/handler';
// import { scoringService } from 'src/services/jobScorer';
// import { sendPipelineEvent } from 'src/services/pipelineEventSender';

/**
 * Tests connectivity to ensure appropriate access and network configuration.
 */
// const smokeTest = async () => {
//   await Promise.all([scoringService.smokeTest(), sendPipelineEvent({}, true)]);
// };

export const handler = createHandler<APIGatewayProxyEventV2>(
  // eslint-disable-next-line @typescript-eslint/require-await
  async (event) => {
    console.log(event.body);
    const regex = /text=([a-z]{5})&api_app/m;
    if (event.body !== undefined) {
      const wordInput = event.body.match(regex);
      if (wordInput !== null) {
        return {
          statusCode: 200,
          body: wordInput[1],
        };
      }
    }
    return {
      statusCode: 200,
      body: 'Not a valid wordle word',
    };
  },
);
