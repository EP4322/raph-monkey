export type Guess = {
  user: string;
  timeStamp: string;
  guessNumber: number;
  guess: string;
  uiOutput: string;
};

export type LeaderBoard = {
  user: 'LeaderBoard';
  timeStamp: string;
  score: number;
  leaderName: string;
  targetWord: string;
};

export type SlashCommand = {
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
};

export type DailyWord = {
  word: string;
  user: 'Master';
  timeStamp: string;
};
