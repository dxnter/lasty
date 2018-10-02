const Discord = require('discord.js');

module.exports.run = (bot, message, args) => message.channel.send(new Discord.RichEmbed().setColor('#E31C23'));

module.exports.help = {
  name: 'help',
};
