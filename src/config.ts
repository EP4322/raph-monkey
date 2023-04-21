import { Env } from 'skuba-dive';

interface Config {
  environment: Environment;

  logLevel: string;
  metrics: boolean;
  name: string;
  version: string;
  raphGuessesTable: string;
}

type Environment = (typeof environments)[number];

const environments = ['local', 'test', 'dev', 'prod'] as const;

const environment = Env.oneOf(environments)('ENVIRONMENT');

/* istanbul ignore next: config verification makes more sense in a smoke test */
const configs: Record<Environment, () => Omit<Config, 'environment'>> = {
  local: () => ({
    logLevel: 'debug',
    metrics: false,
    name: 'raph-monkey',
    version: 'local',
    raphGuessesTable: 'raph-guesses',
  }),

  test: () => ({
    ...configs.local(),

    logLevel: Env.string('LOG_LEVEL', { default: 'silent' }),
    version: 'test',
  }),

  dev: () => ({
    ...configs.prod(),

    logLevel: 'debug',
  }),

  prod: () => ({
    logLevel: 'info',
    metrics: true,
    name: Env.string('SERVICE'),
    version: Env.string('VERSION'),
    raphGuessesTable: 'raph-guesses',
    // raphGuessesTable: Env.string('RAPH_GUESSES_TABLE'),
  }),
};

export const config: Config = {
  ...configs[environment](),
  environment,
};
