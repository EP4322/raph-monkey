import 'skuba-dive/register';
import * as fs from 'fs';
import querystring from 'querystring';

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';
import { APIGatewayProxyEventV2 } from 'aws-lambda';

import { createHandler } from 'src/framework/handler';

import { config } from './config';
import { findWordOfTheDay } from './getDailyWord';

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

export const storeScore = async (score: LeaderBoard): Promise<void> => {
  console.log(JSON.stringify(config.raphGuessesTable));
  await ddbClient.put({
    Item: score,
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
      ':timeStamp': timeStamp,
    },
  });

  return (output.Items ?? []) as Guess[];
};

export const getScores = async (
  user: string,
  timeStamp: string,
): Promise<LeaderBoard[]> => {
  const output = await ddbClient.query({
    TableName: config.raphGuessesTable,
    KeyConditionExpression:
      '#user = :user AND begins_with(#timeStamp, :timeStamp)',
    ExpressionAttributeNames: { '#user': 'user', '#timeStamp': 'timeStamp' },
    ExpressionAttributeValues: {
      ':user': user,
      ':timeStamp': timeStamp,
    },
  });

  return (output.Items ?? []) as LeaderBoard[];
};

interface Guess {
  user: string;
  timeStamp: string;
  guessNumber: number;
  guess: string;
  uiOutput: string;
}

interface LeaderBoard {
  user: 'LeaderBoard';
  timeStamp: string;
  score: number;
  leaderName: string;
  targetWord: string;
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
    const { uiOutput, previousGuessesUi } = await wordleReturn(
      splitInput[1].toLowerCase(),
      user,
    );
    return {
      status: 200,
      result: previousGuessesUi.concat('`', splitInput[1], ':`', uiOutput),
    };
  }

  if (
    splitInput[0] === 'guess' &&
    splitInput[1].length !== 5 &&
    splitInput.length === 2
  ) {
    return {
      status: 200,
      result: 'Word length must be 5 letters. You entered '.concat(
        '`',
        splitInput[1],
        '`',
      ),
    };
  }

  if (splitInput[0] === 'help' && splitInput.length === 1) {
    return {
      status: 200,
      result:
        'Use command "guess <word>" to make a wordle guess! Normal wordle rules apply :monkey: \n \n(But beware of the twist...:clock1: ) \n \n Want to see todays top scores? Use "leader" to find out',
    };
  }

  if (splitInput[0] === 'leader' && splitInput.length === 1) {
    return {
      status: 200,
      result: await listOfLeaders(),
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
    const uiOutput = 'Not a valid guess';
    const previousGuessesUi = '';
    return { uiOutput, previousGuessesUi };
  }

  const todaysDateAll = new Date();
  const todaysDate = todaysDateAll.toISOString().split('T')[0];

  const pastGuesses = await getGuesses(user, todaysDate);
  console.log(pastGuesses.length);
  if (
    pastGuesses.length > 1 &&
    pastGuesses[pastGuesses.length - 1].guessNumber === 666
  ) {
    return {
      uiOutput: pastGuesses[pastGuesses.length - 1].uiOutput,
      previousGuessesUi: '',
    };
  }

  let previousGuessesUi = '';
  for (let i = 0; i < pastGuesses.length; i++) {
    previousGuessesUi += '`'.concat(
      pastGuesses[i].guess,
      ':`',
      pastGuesses[i].uiOutput,
      '\n \n',
    );
  }

  const targetWord = await findWordOfTheDay();
  console.log('Word of the day is: ');
  console.log(targetWord);
  const targetCharacters = countCharacterOccurrence(targetWord);

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
    if (targetWord[i] === guess[i]) {
      defaultResponse[i] = ':large_green_circle: ';
      correctLetter += guess[i];
    }
  }

  for (let i = 0; i < 5; i++) {
    if (targetWord.includes(guess[i])) {
      if (!correctLetter.includes(guess[i])) {
        defaultResponse[i] = ':large_yellow_circle: ';
        correctLetter += guess[i];
      } else if (targetCharacters[guess[i]] > 1 && targetWord[i] !== guess[i]) {
        defaultResponse[i] = ':large_yellow_circle: ';
        correctLetter += guess[i];
        targetCharacters[guess[i]] = targetCharacters[guess[i]] - 1;
      }
    }
    uiOutput += defaultResponse[i];
  }

  const currentGuessNumber = pastGuesses.length + 1;

  if (currentGuessNumber > 6) {
    uiOutput = `Guess limit has already been reached. Todays word was: ${targetWord}`;
    return { uiOutput, previousGuessesUi };
  }

  if (currentGuessNumber === 6 && guess !== targetWord) {
    uiOutput = `Guess limit has already been reached. Todays word was: ${targetWord}`;
    return { uiOutput, previousGuessesUi };
  }

  const guessStoring: Guess = {
    user,
    timeStamp: todaysDateAll.toISOString(),
    guessNumber: currentGuessNumber,
    guess,
    uiOutput,
  };

  console.log(guessStoring);
  await storeGuess(guessStoring);

  if (guess === targetWord) {
    const start = new Date(pastGuesses[0].timeStamp).getTime();
    const end = new Date(guessStoring.timeStamp).getTime();
    const timeDifference = Math.round((end - start) / 1000);
    const score = Math.round(
      guessStoring.guessNumber * 50 - 50 + timeDifference * 3,
    );

    uiOutput += `\n \n :tada: Correct in ${currentGuessNumber} attempts \n \n :clock1: of ${timeDifference} s \n \n Your score is: ${score}`;

    const stopGuessingFlag: Guess = {
      user,
      timeStamp: todaysDateAll.toISOString(),
      guessNumber: 666,
      guess: 'Stop Flag',
      uiOutput: 'You already have completed todays RaphMonkey Wordle',
    };

    const leaderBoardStore: LeaderBoard = {
      user: 'LeaderBoard',
      timeStamp: todaysDateAll.toISOString(),
      score,
      leaderName: user,
      targetWord,
    };

    await storeGuess(stopGuessingFlag);
    await storeScore(leaderBoardStore);
  }
  return { uiOutput, previousGuessesUi };
};

const listOfLeaders = async () => {
  // console.log('Getting leaders');
  const todaysDateAll = new Date();
  const todaysDate = todaysDateAll.toISOString().split('T')[0];
  const todaysScores = await getScores('LeaderBoard', todaysDate);
  const orderedScores = todaysScores.sort((a, b) => b.score - a.score);
  // console.log(orderedScores);

  let uiOutput = `:first_place_medal: Todays Leader Board - ${todaysDate} \n \n`;
  for (let i = 0; i < orderedScores.length; i++) {
    uiOutput += (i + 1)
      .toString()
      .concat(
        '. ',
        orderedScores[i].leaderName,
        ': ',
        orderedScores[i].score.toString(),
        '\n \n',
      );
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
