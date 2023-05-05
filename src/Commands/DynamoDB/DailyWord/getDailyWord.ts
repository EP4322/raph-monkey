import * as fs from 'fs/promises';

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';

import { todaysDate, todaysDateAll } from 'src/app';

import { config } from '../../../config';
import { DailyWord } from '../../../types';

const ddbClient = DynamoDBDocument.from(new DynamoDBClient({}));

export const createDailyWord = async (): Promise<void> => {
  const dailyWordStore: DailyWord = {
    word: await daily(),
    user: 'Master',
    timeStamp: todaysDateAll().toISOString(),
  };

  await ddbClient.put({
    Item: dailyWordStore,
    TableName: config.raphGuessesTable,
  });
};

export const getDailyWord = async (): Promise<DailyWord[]> => {
  const output = await ddbClient.query({
    TableName: config.raphGuessesTable,
    KeyConditionExpression:
      '#user = :user AND begins_with(#timeStamp, :timeStamp)',
    ExpressionAttributeNames: { '#user': 'user', '#timeStamp': 'timeStamp' },
    ExpressionAttributeValues: {
      ':user': 'Master',
      ':timeStamp': todaysDate,
    },
  });
  return (output.Items ?? []) as DailyWord[];
};

const daily = async () => {
  const raphBotWords = await fs.readFile(
    'src/Assets/PossibleWords.txt',
    'utf-8',
  );
  const lineByLine = raphBotWords.split('\n');
  const randomNum = Math.floor(Math.random() * lineByLine.length);
  const wordOfTheDay = lineByLine[randomNum];
  // TODO: Add to a bucket for editing. Cannot edit in deployed version.
  // const linesExceptRemoved = raphBotWords.replace(wordOfTheDay, '');
  // await fs.writeFile('src/Assets/PossibleWords.txt', linesExceptRemoved);
  return wordOfTheDay;
};

const findWordOfTheDay = async () => {
  let collectedWord = await getDailyWord();
  if (collectedWord.length === 0) {
    await createDailyWord();
    collectedWord = await getDailyWord();
  }

  if (collectedWord.length > 1) {
    // TODO: Add Error Handling
    console.log('ERROR');
  }

  return collectedWord[0].word;
};

export { findWordOfTheDay };
