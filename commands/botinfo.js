const Discord = require('discord.js');

module.exports.run = async (bot, message, args) => {
  const author = await message.guild.members.get('136246346280730624');
  return message.channel.send(
    new Discord.RichEmbed()
      .setThumbnail(bot.user.displayAvatarURL)
      .setColor('#E31C23')
      .setTitle('Lasty Information')
      .addField('Description', 'Lasty creates customizable Last.FM charts along with miscellaneous commands.')
      .addField('Created On', bot.user.createdAt)
      .addField('Developer', author)
  );
};

module.exports.help = {
  name: 'botinfo',
};
