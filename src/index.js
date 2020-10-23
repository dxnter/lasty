import { Client } from 'discord.js-commando';
import path from 'path';
import { CronJob } from 'cron';
import './db';
import checkIfValidToken from './utils/checkIfValidToken';
import weeklyStatCron from './utils/weeklyStatCron';
import { PREFIX, DISCORD_BOT_TOKEN } from '../config.json';

checkIfValidToken();

const client = new Client({
  commandPrefix: PREFIX,
  owner: '136246346280730624',
  disableMentions: 'everyone'
});

client.registry
  .registerDefaultTypes()
  .registerGroups([
    ['lastfm', 'Last.fm'],
    ['util', 'Util']
  ])
  .registerDefaultCommands({
    help: false,
    ping: false,
    prefix: true,
    commandState: false,
    unknownCommand: false
  })
  .registerCommandsIn(path.join(__dirname, 'commands'));

client.on('ready', () => require('./events/ready')(client));

new CronJob(
  '0 12 * * 0',
  () => {
    weeklyStatCron(client);
  },
  null,
  true,
  'America/Chicago'
);

client.login(DISCORD_BOT_TOKEN);
