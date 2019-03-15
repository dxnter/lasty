import Discord from 'discord.js';

module.exports.run = async (bot, message, args) =>
  message.channel.send(
    new Discord.RichEmbed()
      .setThumbnail(bot.user.displayAvatarURL)
      .setColor('#E31C23')
      .setTitle('Lasty')
      .addField(
        'Description',
        'Lasty creates customizable Last.FM charts along with miscellaneous commands.'
      )
      .addField('Total Users', bot.users.size)
      .addField('Total Servers', bot.guilds.size)
      .addField('Created On', bot.user.createdAt)
      .addField('Developer', '<@136246346280730624>')
      .addField('Source Code', 'https://github.com/dxnter/lasty')
  );

module.exports.help = {
  name: 'botinfo'
};
