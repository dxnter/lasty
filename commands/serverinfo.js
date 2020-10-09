import Discord from 'discord.js';

module.exports = {
  name: 'serverinfo',
  run: async (bot, message) =>
    message.channel.send(
      new Discord.RichEmbed()
        .setThumbnail(message.guild.iconURL)
        .setColor('#E31C23')
        .setTitle('Server Information')
        .addField('Server Name', message.guild.name)
        .addField('Total Members', message.guild.memberCount)
        .addField('Created On', message.guild.createdAt)
    )
};
