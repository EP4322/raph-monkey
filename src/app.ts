import 'skuba-dive/register';
import * as fs from 'fs';
import querystring from 'querystring';

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';
import { APIGatewayProxyEventV2 } from 'aws-lambda';

import { createHandler } from 'src/framework/handler';

import { config } from './config';

// import { scoringService } from 'src/services/jobScorer';
// import { sendPipelineEvent } from 'src/services/pipelineEventSender';

/**
 * Tests connectivity to ensure appropriate access and network configuration.
 */
// const smokeTest = async () => {
//   await Promise.all([scoringService.smokeTest(), sendPipelineEvent({}, true)]);
// };

const words = fs.readFileSync('src/Assets/AcceptedWords.txt', 'utf-8');
const ddbClient = DynamoDBDocument.from(new DynamoDBClient({}));

export const storeGuess = async (guess: Guess): Promise<void> => {
  console.log(JSON.stringify(config.raphGuessesTable));
  await ddbClient.put({
    Item: guess,
    TableName: config.raphGuessesTable,
  });
};

export const getGuesses = async (
  user: string,
  timeStamp: string,
): Promise<Guess[]> => {
  const output = await ddbClient.query({
    TableName: config.raphGuessesTable,
    KeyConditionExpression:
      '#user = :user AND begins_with(#timeStamp, :timeStamp)',
    ExpressionAttributeNames: { '#user': 'user', '#timeStamp': 'timeStamp' },
    ExpressionAttributeValues: {
      ':user': user,
      ':timeStamp': timeStamp, // '2023-04-24',
    },
    // Key: { user: 'Emma', timeStamp: '2023-04-21T00:57:27.600Z' },
  });

  return (output.Items ?? []) as Guess[];
};

interface Guess {
  user: string;
  timeStamp: string;
  guessNumber: number;
  guess: string;
}

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

const checkInput = async (inputCommand: string, user: string) => {
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
        await wordleReturn(splitInput[1].toLowerCase(), user),
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

const wordleReturn = async (guess: string, user: string) => {
  if (!wordleValidGuess(guess)) {
    return 'Not a valid guess';
  }

  const todaysDateAll = new Date();
  const todaysDate = todaysDateAll.toISOString().split('T')[0];

  const pastGuesses = await getGuesses(user, todaysDate);
  console.log(pastGuesses.length);

  const currentGuessNumber = pastGuesses.length + 1;
  const guessStoring: Guess = {
    user,
    timeStamp: todaysDateAll.toISOString(),
    guessNumber: currentGuessNumber,
    guess,
  };

  console.log(guessStoring);
  await storeGuess(guessStoring);

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
    uiOutput += `\n :tada: Correct in ${currentGuessNumber} attempts :tada:`;
  }
  return uiOutput;
};

export const handler = createHandler<APIGatewayProxyEventV2>(
  // eslint-disable-next-line @typescript-eslint/require-await
  async (event) => {
    if (event.body === undefined) {
      return {
        statusCode: 400,
        body: 'Not a valid request',
      };
    }

    const slackObject = querystring.parse(
      event.body,
    ) as unknown as SlashCommand;
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
