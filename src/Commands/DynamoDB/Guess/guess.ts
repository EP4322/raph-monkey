import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';

import { config } from 'src/config';
import { Guess } from 'src/types';

const ddbClient = DynamoDBDocument.from(new DynamoDBClient({}));

export const storeGuess = async (guess: Guess): Promise<void> => {
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
      ':timeStamp': timeStamp,
    },
  });

  return (output.Items ?? []) as Guess[];
};
