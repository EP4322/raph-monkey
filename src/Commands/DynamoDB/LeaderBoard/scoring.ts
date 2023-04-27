import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';

import { config } from 'src/config';
import { LeaderBoard } from 'src/types';

const ddbClient = DynamoDBDocument.from(new DynamoDBClient({}));

export const storeScore = async (score: LeaderBoard): Promise<void> => {
  await ddbClient.put({
    Item: score,
    TableName: config.raphGuessesTable,
  });
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
