require('dotenv').config();

const Discord = require('discord.js');
const mongoose = require('mongoose');
const fs = require('fs');
const chalk = require('chalk');

const log = console.log;
const { DISCORD_BOT_TOKEN, PREFIX } = process.env;

const addStar = require('./services/addStar');
const removeStar = require('./services/removeStar');

mongoose
  .connect(
    process.env.DATABASE_URL,
    { useNewUrlParser: true }
  )
  .then(() =>
    log(chalk.green('[MongoDB] Successfully connected to the database'))
  )
  .catch(err => log('Something went wrong', err));

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
      `[Discord.js] ${bot.user.username} is online on ${
        bot.guilds.size
      } servers!`
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

bot.on('messageReactionAdd', (reaction, user) => addStar(reaction, user));

bot.on('messageReactionRemove', (reaction, user) => removeStar(reaction, user));

bot.on('error', console.error);

bot.login(DISCORD_BOT_TOKEN);
