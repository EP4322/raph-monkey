import 'skuba-dive/register';

import * as fs from 'fs/promises';
import querystring from 'querystring';

import { APIGatewayProxyEventV2 } from 'aws-lambda';

import { createHandler } from 'src/framework/handler';

import { checkInput } from './Commands/CheckingInput/checkInput';
import { SlashCommand } from './types';

// import { scoringService } from 'src/services/jobScorer';
// import { sendPipelineEvent } from 'src/services/pipelineEventSender';

/**
 * Tests connectivity to ensure appropriate access and network configuration.
 */
// const smokeTest = async () => {
//   await Promise.all([scoringService.smokeTest(), sendPipelineEvent({}, true)]);
// };
const words = fs.readFile('src/Assets/AcceptedWords.txt', 'utf-8');
const todaysDateAll = new Date();
todaysDateAll.setHours(todaysDateAll.getHours() + 7);
export { todaysDateAll };
export const todaysDate = todaysDateAll.toISOString().split('T')[0];

export const wordleValidGuess = async (guess: string): Promise<boolean> =>
  (await words).includes(guess);

export const handler = createHandler<APIGatewayProxyEventV2>(
  // eslint-disable-next-line @typescript-eslint/require-await
  async (event) => {
    if (event.body === undefined) {
      return {
        statusCode: 400,
        body: 'Not a valid request',
      };
    }

    const body = Buffer.from(event.body, 'base64').toString();
    const slackObject = querystring.parse(body) as unknown as SlashCommand;
    console.log(body);
    const { status, result } = await checkInput(
      slackObject.text,
      slackObject.user_name,
    );

    return {
      statusCode: status,
      body: result,
    };
  },
);
