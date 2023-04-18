import 'skuba-dive/register';
import querystring from 'querystring';

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

interface SlashCommand {
  token: string;
  team_id: string;
  team_domain: string;
  channel_id: string;
  channel_name: string;
  user_id: string;
  user_name: string;
  command: string;
  text: string;
  api_app_id: string;
  is_enterprise_install: string;
  response_url: string;
  trigger_id: string;
}

const checkWordLength = (inputWord: string) => {
  const splitInput = inputWord.split(' ');
  if (
    splitInput[0] === 'guess' &&
    splitInput[1].length === 5 &&
    splitInput.length === 2
  ) {
    return { status: 200, result: splitInput[1] };
  }

  if (
    splitInput[0] === 'create' &&
    splitInput[1].length === 5 &&
    splitInput.length === 2
  ) {
    return { status: 200, result: 'Wordle Created Successfully' };
  }

  if (splitInput[0] === 'start' && splitInput.length === 1) {
    return { status: 200, result: 'Wordle Started Successfully' };
  }

  if (splitInput[0] === 'help' && splitInput.length === 1) {
    return {
      status: 200,
      result:
        'Use command "start" to begin todays wordle or "guess <word>" to make a wordle guess',
    };
  }

  return {
    status: 200,
    result: 'Not a valid command, use "help" for valid commands',
  };
};

export const handler = createHandler<APIGatewayProxyEventV2>(
  // eslint-disable-next-line @typescript-eslint/require-await
  async (event) => {
    console.log(event.body);
    if (event.body === undefined) {
      return {
        statusCode: 400,
        body: 'Not a valid request',
      };
    }

    const slackObject = querystring.parse(
      event.body,
    ) as unknown as SlashCommand;
    console.log(slackObject.text);
    const { status, result } = checkWordLength(slackObject.text);

    return {
      statusCode: status,
      body: result,
    };
  },
);
