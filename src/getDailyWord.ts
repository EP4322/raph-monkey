import * as fs from 'fs';

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';

import { config } from './config';

const todaysDateAll = new Date();
const todaysDate = todaysDateAll.toISOString().split('T')[0];
const ddbClient = DynamoDBDocument.from(new DynamoDBClient({}));

interface DailyWord {
  word: string;
  user: 'Master';
  timeStamp: string;
}
export const createDailyWord = async (): Promise<void> => {
  const dailyWordStore: DailyWord = {
    word: daily(),
    user: 'Master',
    timeStamp: todaysDateAll.toISOString(),
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
      ':timeStamp': todaysDate, // '2023-04-24',
    },
    // Key: { user: 'Emma', timeStamp: '2023-04-21T00:57:27.600Z' },
  });
  return (output.Items ?? []) as DailyWord[];
};

const daily = () => {
  const raphBotWords = fs.readFileSync('src/Assets/PossibleWords.txt', 'utf-8');
  const lineByLine = raphBotWords.split('\n');
  const wordOfTheDay =
    lineByLine[Math.floor(Math.random() * lineByLine.length)];
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
