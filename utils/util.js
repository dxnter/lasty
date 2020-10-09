import Discord from 'discord.js';
import {
  READABLE_PERIODS,
  USER_UNDEFINED,
  USER_SET,
  USER_EXISTS,
  USER_UPDATED,
  USER_DELETED,
  USER_UNREGISTERED,
  ARTIST_UNDEFINED,
  ARTIST_INVALID,
  PERIOD_INVALID,
  EMPTY_LISTENING_DATA,
  PERMISSION_INVALID,
  COMMAND_INVALID
} from '../constants';

class Util {
  static delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  static replyEmbedMessage(
    message,
    args,
    description,
    { period, fmUser } = {}
  ) {
    switch (description) {
      case USER_UNDEFINED:
        return message.channel.send(
          new Discord.RichEmbed()
            .setAuthor('❌ Error')
            .setDescription(
              `Last.fm username not set, enter \`,l set <username>\` or enter a username after \`${args[0]}\``
            )
            .setColor('#E31C23')
        );
      case USER_SET:
        return message.channel.send(
          new Discord.RichEmbed()
            .setAuthor('✅ Success')
            .setDescription(`Last.fm username set to **${fmUser}**`)
            .setColor('#00db3e')
        );
      case USER_EXISTS:
        return message.channel.send(
          new Discord.RichEmbed()
            .setAuthor('❌ Error')
            .setDescription(`Last.fm username is already set to **${fmUser}**`)
            .setColor('#E31C23')
        );
      case USER_UPDATED:
        return message.channel.send(
          new Discord.RichEmbed()
            .setAuthor('✅ Success')
            .setDescription(`Last.fm username updated to **${fmUser}**`)
            .setColor('#00db3e')
        );
      case USER_DELETED:
        return message.channel.send(
          new Discord.RichEmbed()
            .setAuthor('✅ Success')
            .setDescription(`**${fmUser}** has been deleted from the database`)
            .setColor('#00db3e')
        );
      case USER_UNREGISTERED:
        return message.channel.send(
          new Discord.RichEmbed()
            .setAuthor('❌ Error')
            .setDescription(`**${fmUser}** is not a registered Last.FM user`)
            .setColor('#E31C23')
        );
      case ARTIST_UNDEFINED:
        return message.channel.send(
          new Discord.RichEmbed()
            .setAuthor('❌ Error')
            .setDescription(`Enter the name of an artist after \`topalbums\``)
            .setColor('#E31C23')
        );
      case ARTIST_INVALID:
        return message.channel.send(
          new Discord.RichEmbed()
            .setAuthor('❌ Error')
            .setDescription(`No albums found for **${args[1]}**`)
            .setColor('#E31C23')
        );
      case PERIOD_INVALID:
        return message.channel.send(
          new Discord.RichEmbed()
            .setAuthor('❌ Error')
            .setDescription(
              `Invalid period: **${period}**\nPeriods:  \`week\`, \`month\`, \`90\`, \`180\`, \`year\`, \`all\` (Default: all)`
            )
            .setColor('#E31C23')
        );
      case EMPTY_LISTENING_DATA:
        return message.channel.send(
          new Discord.RichEmbed()
            .setAuthor('❌ Error')
            .setDescription(
              `**${fmUser}** hasn't listened to anything recently...`
            )
            .setColor('#E31C23')
        );
      case PERMISSION_INVALID:
        return message.channel.send(
          new Discord.RichEmbed()
            .setAuthor('❌ Error')
            .setDescription(`You do not have permission to do that`)
            .setColor('#E31C23')
        );
      case COMMAND_INVALID:
        return message.channel.send(
          new Discord.RichEmbed()
            .setAuthor('❌ Error')
            .setDescription(`Invalid command, try \`,l help\``)
            .setColor('#E31C23')
        );
    }
  }

  static makeReadablePeriod(period) {
    if (period in READABLE_PERIODS) return READABLE_PERIODS[period];
    return 'Overall';
  }

  static sortTopAlbums() {
    return (a, b) => b.playcount - a.playcount;
  }

  static pluralize(word) {
    if (word.endsWith('s')) return `${word}'`;
    return `${word}'s`;
  }
}

export { Util };
