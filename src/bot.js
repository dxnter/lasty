import Discord from 'discord.js';
import fs from 'fs';
import chalk from 'chalk';
import { CronJob } from 'cron';
import './db';
import weeklyStatCron from './utils/weeklyStatCron';

import { DISCORD_BOT_TOKEN, PREFIX } from '../config.json';

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
  console.log(chalk.blue(`[Discord.js] ${bot.user.username} is online!`));
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
