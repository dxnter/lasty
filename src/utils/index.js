import Discord from 'discord.js';
import {
  ERROR,
  SUCCESS,
  READABLE_PERIODS,
  USER_UNDEFINED,
  USER_UNDEFINED_ARGS,
  USER_SET,
  USER_EXISTS,
  USER_UPDATED,
  USER_DELETED,
  USER_UNSUBSCRIBED,
  USER_ALREADY_SUBSCRIBED,
  USER_ALREADY_UNSUBSCRIBED,
  USER_UNREGISTERED,
  ARTIST_UNDEFINED,
  ARTIST_NOT_FOUND,
  ARTIST_INVALID,
  PERIOD_INVALID,
  EMPTY_LISTENING_DATA,
  TRACK_NOT_FOUND,
  PERMISSION_INVALID,
  COMMAND_INVALID,
  USER_SUBSCRIBED
} from '../constants';

export const makeReadablePeriod = period => {
  if (period in READABLE_PERIODS) return READABLE_PERIODS[period];
  return 'Overall';
};

export const sortTotalListeners = () => {
  return (a, b) => b.playcount - a.playcount;
};

export const pluralize = word => {
  if (word.endsWith('s')) return `${word}'`;
  return `${word}'s`;
};

const createEmbedMessage = (status, statusDescription) => {
  return new Discord.MessageEmbed()
    .setAuthor(status === SUCCESS ? '✅ Success' : '❌ Error')
    .setDescription(statusDescription)
    .setColor('#E31C23');
};

export const replyEmbedMessage = (
  message,
  args,
  statusDescription,
  { period, fmUser, artist } = {}
) => {
  switch (statusDescription) {
    case USER_UNDEFINED_ARGS:
      return message.channel.send(
        createEmbedMessage(
          ERROR,
          `Last.fm username not set, enter \`,l set <username>\` or enter a username after \`${args[0]}\``
        )
      );
    case USER_UNDEFINED:
      return message.channel.send(
        createEmbedMessage(
          ERROR,
          `Last.fm username not set, enter \`,l set <username>\``
        )
      );
    case USER_SET:
      return message.channel.send(
        createEmbedMessage(SUCCESS, `Last.fm username set to **${fmUser}**`)
      );
    case USER_EXISTS:
      return message.channel.send(
        createEmbedMessage(
          ERROR,
          `Last.fm username is already set to **${fmUser}**`
        )
      );
    case USER_UPDATED:
      return message.channel.send(
        createEmbedMessage(SUCCESS, `Last.fm username updated to **${fmUser}**`)
      );
    case USER_DELETED:
      return message.channel.send(
        createEmbedMessage(
          SUCCESS,
          `**${fmUser}** has been deleted from the database`
        )
      );
    case USER_SUBSCRIBED:
      return message.channel.send(
        createEmbedMessage(SUCCESS, 'Subscribed to the Weekly Recap!')
      );
    case USER_UNSUBSCRIBED:
      return message.channel.send(
        createEmbedMessage(SUCCESS, 'Unsubscribed from the Weekly Recap!')
      );
    case USER_ALREADY_SUBSCRIBED:
      return message.channel.send(
        createEmbedMessage(
          ERROR,
          'You are already subscribed to the Weekly Recap!'
        )
      );
    case USER_ALREADY_UNSUBSCRIBED:
      return message.channel.send(
        createEmbedMessage(
          ERROR,
          'You are already unsubscribed to the Weekly Recap!'
        )
      );
    case USER_UNREGISTERED:
      return message.channel.send(
        createEmbedMessage(
          ERROR,
          `**${fmUser}** is not a registered Last.FM user`
        )
      );
    case ARTIST_UNDEFINED:
      return message.channel.send(
        createEmbedMessage(
          ERROR,
          `Enter the name of an artist after \`${args[0]}\``
        )
      );
    case ARTIST_INVALID:
      return message.channel.send(
        createEmbedMessage(ERROR, `No albums found for **${artist}**`)
      );
    case ARTIST_NOT_FOUND:
      return message.channel.send(
        createEmbedMessage(ERROR, `No artist found named **${artist}**`)
      );
    case PERIOD_INVALID:
      return message.channel.send(
        createEmbedMessage(
          ERROR,
          `Invalid period: **${period}**\nPeriods:  \`week\`, \`month\`, \`90\`, \`180\`, \`year\`, \`all\` (Default: all)`
        )
      );
    case EMPTY_LISTENING_DATA:
      return message.channel.send(
        createEmbedMessage(
          ERROR,
          `**${fmUser}** hasn't listened to anything recently...`
        )
      );
    case TRACK_NOT_FOUND:
      return message.channel.send(
        createEmbedMessage(ERROR, `Track not found on Last.fm!`)
      );

    case PERMISSION_INVALID:
      return message.channel.send(
        createEmbedMessage(ERROR, `You do not have permission to do that`)
      );
    case COMMAND_INVALID:
      return message.channel.send(
        createEmbedMessage(ERROR, `Invalid command, try \`,l help\``)
      );
  }
};

export const helpMessageEmbed = () => {
  return new Discord.MessageEmbed()
    .setTitle('Lasty Commands')
    .addFields([
      {
        name: 'set - Sets Last.fm username.',
        value: 'Example: `,l set iiMittens`'
      },
      {
        name: 'delete - Deletes saved Last.fm username',
        value: 'Alternate: `reset`'
      },
      {
        name: 'info - Shows Last.FM account information',
        value: 'Example: `,l info`'
      },
      {
        name: 'np - Shows currently playing song. (Without`,l` prefix)',
        value: 'Example: `,np` or `,np iiMittens`'
      },
      {
        name: 'recent - Shows 10 most recent tracks played.',
        value: 'Alternate: None'
      },
      {
        name: 'topalbums - Shows the top albums by an artist',
        value: 'Example: ,l topalbums Kendrick Lamar'
      },
      {
        name: 'toptracks - Shows the top tracks by an artist',
        value: 'Example: ,l toptracks Radiohead'
      },
      {
        name: '\u200b',
        value: '\u200b'
      },
      {
        name: 'Command Paramaters',
        value: '`week`, `month`, `90`, `180`, `year`, `all` (Default: all)'
      },
      {
        name: 'tracks - Shows most played tracks',
        value: 'Example: `,l tracks iiMittens month`'
      },
      {
        name: 'artists - Shows most listened artists',
        value: 'Example: `,l artists week`'
      },
      {
        name: 'albums - Shows most played albums',
        value: 'Example: `,l albums Reversibly 90`'
      }
    ])
    .setColor('#E31C23');
};
