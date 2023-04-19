import 'skuba-dive/register';
import * as fs from 'fs';
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

const words = fs.readFileSync('src/Assets/AcceptedWords.txt', 'utf-8');
const wordList = words.split('\r\n');

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

const checkInput = (inputCommand: string) => {
  const splitInput = inputCommand.split(' ');
  if (
    splitInput[0] === 'guess' &&
    splitInput[1].length === 5 &&
    splitInput.length === 2
  ) {
    return {
      status: 200,
      result: '`'.concat(
        splitInput[1],
        ':`',
        wordleReturn(splitInput[1].toLowerCase()),
      ),
    };
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

const wordleValidGuess = (guess: string) => words.includes(guess);

const countCharacterOccurrence = (target: string) => {
  const characterOccurrences: { [key: string]: number } = {};
  for (let x = 0, length = target.length; x < length; x++) {
    const l = target.charAt(x);
    characterOccurrences[l] = isNaN(characterOccurrences[l])
      ? 1
      : characterOccurrences[l] + 1;
  }
  return characterOccurrences;
};

const wordleReturn = (guess: string) => {
  if (!wordleValidGuess(guess)) {
    return 'Not a valid guess';
  }

  const sampleTarget = 'sorry';
  const targetCharacters = countCharacterOccurrence(sampleTarget);

  const incorrect = ':black_circle: ';
  const defaultResponse = [
    incorrect,
    incorrect,
    incorrect,
    incorrect,
    incorrect,
  ];

  let uiOutput = '';
  let correctLetter = '';

  for (let i = 0; i < 5; i++) {
    if (sampleTarget[i] === guess[i]) {
      defaultResponse[i] = ':large_green_circle: ';
      correctLetter += guess[i];
    }
  }

  for (let i = 0; i < 5; i++) {
    if (sampleTarget.includes(guess[i])) {
      if (!correctLetter.includes(guess[i])) {
        defaultResponse[i] = ':large_yellow_circle: ';
        correctLetter += guess[i];
      } else if (
        targetCharacters[guess[i]] > 1 &&
        sampleTarget[i] !== guess[i]
      ) {
        defaultResponse[i] = ':large_yellow_circle: ';
        correctLetter += guess[i];
        targetCharacters[guess[i]] = targetCharacters[guess[i]] - 1;
      }
    }
    uiOutput += defaultResponse[i];
  }

  if (guess === sampleTarget) {
    uiOutput += '\n :tada: Correct in {get number attempts} attempts :tada:';
  }
  return uiOutput;
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
    const { status, result } = checkInput(slackObject.text);

    return {
      statusCode: status,
      body: result,
    };
  },
);
