import lastyClient from './structures/Client';
import { CronJob } from 'cron';
import './db';
import validateToken from './utils/validateToken';
import Utilities from './structures/Utilities';
import weeklyStatCron from './utils/weeklyStatCron';
import { EMBED_COLOR } from '../config.json';

validateToken();
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
