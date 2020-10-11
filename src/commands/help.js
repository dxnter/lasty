import Discord from 'discord.js';
import { PREFIX } from '../../config.json';

module.exports = {
  name: 'help',
  run: (bot, message) =>
    message.channel.send(
      new Discord.MessageEmbed()
        .setColor('#E31C23')
        .addField('Lasty Commands', `Run commands with prefix \`${PREFIX}\``)
        .addField('`l`', 'Last.fm statistics and charts, `,l help`')
        .addField(
          '`np`',
          'Displays last played track on Last.fm `,np` or `,np [username]`'
        )
        .addField('`botinfo`', 'Display information about Lasty')
        .addField('`serverinfo`', 'Display information about the server')
        .addField('clear', 'Delete a number of messages in chat. `,clear 20`')
    )
};
