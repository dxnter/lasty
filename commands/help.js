import Discord from 'discord.js';

module.exports = {
  name: 'help',
  run: (bot, message) =>
    message.channel.send(
      new Discord.RichEmbed()
        .setColor('#E31C23')
        .addField(
          'Lasty Commands',
          `Run commands with prefix \`${process.env.PREFIX}\``
        )
        .addField('`l`', 'Last.fm statistics and charts, `,l help`')
        .addField(
          '`np`',
          'Shows last played track on Last.fm `,np` or `,np [username]`'
        )
        .addField('`botinfo`', 'Display information about Lasty')
        .addField('`serverinfo`', 'Display information about the server')
    )
};
