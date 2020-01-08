import Discord from 'discord.js';
import fs from 'fs';
import chalk from 'chalk';
import { CronJob } from 'cron';
import './db';

import weeklyStatCron from './utils/weeklyStatCron';

require('dotenv').config();

const log = console.log;
const { LASTFM_API_KEY, DISCORD_BOT_TOKEN, PREFIX } = process.env;

const bot = new Discord.Client({ disableEveryone: true });
bot.commands = new Discord.Collection();

fs.readdir('./commands/', (err, files) => {
  if (err) log(err);

  const jsfiles = files.filter(f => f.split('.').pop() === 'js');
  if (jsfiles.length <= 0) {
    log("Couldn't find commmands");
    return;
  }

  jsfiles.forEach((f, i) => {
    const props = require(`./commands/${f}`);
    bot.commands.set(props.help.name, props);
  });
});

bot.on('ready', async () => {
  log(
    chalk.blue(
      `[Discord.js] ${bot.user.username} is online on ${bot.guilds.size} servers!`
    )
  );
  bot.user.setActivity('with code | ,help', { type: 'PLAYING' });
});

bot.on('message', async message => {
  if (message.author.bot) return;
  if (message.channel.type === 'dm') return;

  const messageArray = message.content.split(' ');
  const cmd = messageArray[0];
  const args = messageArray.slice(1);

  const commandFile = bot.commands.get(cmd.slice(PREFIX.length));
  if (commandFile) commandFile.run(bot, message, args);
});

new CronJob(
  '0 23 * * *',
  weeklyStatCron(bot, LASTFM_API_KEY),
  null,
  true,
  'America/Chicago'
);

bot.on('error', console.error);

bot.login(DISCORD_BOT_TOKEN);
