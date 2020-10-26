import chalk from 'chalk';
import { isValidToken } from '../../src/api/lastfm';
import { LASTFM_API_KEY } from '../../config.json';

export default async () => {
  if (!(await isValidToken(LASTFM_API_KEY))) {
    console.log(chalk`{red.bold [Error] Invalid Last.fm API Key. Visit the link below for a key.\n}
    {white https://www.last.fm/api/account/create​}
    `);
    process.exit(0);
  }
};
