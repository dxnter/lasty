const Discord = require('discord.js');

module.exports.run = async (bot, message, args) =>
  message.channel.send(
    new Discord.RichEmbed()
      .setThumbnail(message.guild.iconURL)
      .setColor('#E31C23')
      .setTitle('Server Information')
      .addField('Server Name', message.guild.name)
      .addField('Total Members', message.guild.memberCount)
      .addField('Created On', message.guild.createdAt)
  );

module.exports.help = {
  name: 'serverinfo',
};
