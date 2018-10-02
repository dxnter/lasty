require('dotenv').config();

const { DISCORD_BOT_TOKEN, PREFIX } = process.env;

const Discord = require('discord.js');
const fs = require('fs');

const bot = new Discord.Client({ disableEveryone: true });
bot.commands = new Discord.Collection();

fs.readdir('./commands/', (err, files) => {
  if (err) console.log(err);

  const jsfiles = files.filter(f => f.split('.').pop() === 'js');
  if (jsfiles.length <= 0) {
    console.log("Couldn't find commmands");
    return;
  }

  jsfiles.forEach((f, i) => {
    const props = require(`./commands/${f}`);
    bot.commands.set(props.help.name, props);
  });
});

bot.on('ready', async () => {
  console.log(`${bot.user.username} is online on ${bot.guilds.size} servers!`);
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

bot.login(DISCORD_BOT_TOKEN);
