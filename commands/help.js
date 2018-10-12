const Discord = require('discord.js');

module.exports.run = (bot, message, args) =>
  message.channel.send(
    new Discord.RichEmbed()
      .setColor('#E31C23')
      .addField('Lasty Commands', `Run commands with prefix \`${process.env.PREFIX}\``)
      .addField('`lf`', 'Last.FM statistics and charts, `,lf help`')
      .addField('`np`', 'Shows last played track on Last.FM `,np` or `,np [username]`')
      .addField('doggo', 'Shows a doggo picture')
      .addField('cat', 'Shows a cat picture')
      .addField('`botinfo`', 'Display information about Lasty')
      .addField('`serverinfo`', 'Display information about the server')
  );

module.exports.help = {
  name: 'help',
};
