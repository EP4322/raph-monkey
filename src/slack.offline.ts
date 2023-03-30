/* eslint-disable no-console */
import querystring from 'querystring';

import { App, SocketModeReceiver } from '@slack/bolt';
import axios from 'axios';
import { Env } from 'skuba-dive';

const socketModeReceiver = new SocketModeReceiver({
  appToken: Env.string('APP_TOKEN'),

  // enable the following if you want to use OAuth
  // clientId: process.env.CLIENT_ID,
  // clientSecret: process.env.CLIENT_SECRET,
  // stateSecret: 'my-state-secret',
  // scopes: ['channels:read', 'chat:write', 'app_mentions:read', 'channels:manage', 'commands'],
});

const app = new App({
  receiver: socketModeReceiver,
  // disable token line below if using OAuth
  token: Env.string('BOT_TOKEN'),
});

// The echo command simply echoes on command
app.command('/raphoffline', async ({ command, ack, respond }) => {
  const response = await axios.post<string>(
    'http://localhost:3000/invoke',
    querystring.stringify(command),
  );
  // Acknowledge command request
  await ack(response.data);
});

(async () => {
  await app.start();
  console.log('⚡️ Bolt app started');
})().catch(console.error);
