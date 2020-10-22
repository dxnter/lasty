import Discord from 'discord.js';
import fs from 'fs';
import chalk from 'chalk';
import { CronJob } from 'cron';
import './db';
import { isValidToken } from '../src/api/lastfm';
import weeklyStatCron from './utils/weeklyStatCron';
import { PREFIX, DISCORD_BOT_TOKEN, LASTFM_API_KEY } from '../config.json';
const log = console.log;

(async () => {
  if (!(await isValidToken(LASTFM_API_KEY))) {
    log(chalk`{red.bold [Error] Invalid Last.fm API Key. Visit the link below for a key.\n}
    {white https://www.last.fm/api/account/create​}
    `);
    process.exit(0);
  }
})();

const bot = new Discord.Client({ disableMentions: 'everyone' });
bot.commands = new Discord.Collection();

const commandFiles = fs
  .readdirSync('src/commands')
  .filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  bot.commands.set(command.name, command);
}

bot.on('ready', async () => {
  log(chalk`{green.bold [Success]} {green Valid Last.fm API Key}`);
  log(
    chalk`{cyan.bold [Discord.js]} {white.bold ${bot.user.username}} {cyan is online!}`
  );
  bot.user.setActivity(' ,l help', { type: 'LISTENING' });
});

bot.on('message', message => {
  if (message.author.bot) return;
  if (message.channel.type === 'dm') return;
  if (!message.content.startsWith(PREFIX)) return;

  const messageArray = message.content.split(' ');
  const cmd = messageArray[0];
  const args = messageArray.slice(1);

  const commandFile = bot.commands.get(cmd.slice(PREFIX.length));
  if (commandFile) commandFile.run(bot, message, args);
});

new CronJob(
  '0 12 * * 0',
  () => {
    weeklyStatCron(bot);
  },
  null,
  true,
  'America/Chicago'
);

bot.on('error', console.error);

bot.login(DISCORD_BOT_TOKEN);
