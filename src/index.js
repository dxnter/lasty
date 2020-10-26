import lastyClient from './structures/Client';
import { CronJob } from 'cron';
import Utilities from './structures/Utilities';
import weeklyStatCron from './utils/weeklyStatCron';
import './db';
import { EMBED_COLOR, LASTFM_API_KEY } from '../config.json';

Utilities.validateToken(LASTFM_API_KEY);
Utilities.validateEmbedColor(EMBED_COLOR);

const client = new lastyClient();

client.init();

new CronJob(
  '0 12 * * 0',
  () => {
    weeklyStatCron(client);
  },
  null,
  true,
  'America/Chicago'
);
