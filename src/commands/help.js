import Discord from 'discord.js';
import { PREFIX } from '../../config.json';

module.exports = {
  name: 'help',
  run: (bot, message) =>
    message.channel.send(
      new Discord.MessageEmbed()
        .setColor('#E31C23')
        .setTitle('Lasty Commands', `Run commands with prefix \`${PREFIX}\``)
        .addFields([
          {
            name: '`l`',
            value: 'Last.fm statistics and charts, try `,l help`'
          },
          {
            name: '`serverinfo`',
            value: 'Display information about the server'
          },
          {
            name: '`clear`',
            value: '**Admin** - Clear a number of messages in chat. `,clear 20`'
          }
        ])
    )
};
