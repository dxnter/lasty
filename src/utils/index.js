import Discord from 'discord.js';
import { PREFIX } from '../../config.json';
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

export const millisToMinutesAndSeconds = millis => {
  const minutes = Math.floor(millis / 60000);
  const seconds = ((millis % 60000) / 1000).toFixed(0);
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
};

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
    .setTitle(`Last.fm Commands - (Use \`${PREFIX}l\` before commands)`)
    .addFields([
      {
        name: '`set`',
        value: 'Sets Last.fm username'
      },
      {
        name: '`delete`',
        value: 'Deletes saved Last.fm username'
      },
      {
        name: '`sub`',
        value: 'Subscribe to the Weekly Recap'
      },
      {
        name: '`unsub`',
        value: 'Unsubscribe to the Weekly Recap'
      },
      {
        name: '`info`',
        value: 'Shows Last.FM account information'
      },
      {
        name: '`np`',
        value: 'Shows currently playing song. (Without `,l` prefix)'
      },
      {
        name: '`recent`',
        value: 'Shows 10 most recent tracks played'
      },
      {
        name: '`tracks`',
        value: 'Shows your most played tracks'
      },
      {
        name: '`artists`',
        value: 'Shows your most listened artists'
      },
      {
        name: '`albums`',
        value: 'Shows your most played albums'
      },
      {
        name: '`artist`',
        value: 'Shows information about an artist'
      },
      {
        name: '`topalbums`',
        value: 'Shows the top albums by an artist'
      },
      {
        name: '`toptracks`',
        value: 'Shows the top tracks by an artist'
      },
      {
        name: '\u200b',
        value: '\u200b'
      },
      {
        name: 'Valid Periods',
        value: '`week`, `month`, `90`, `180`, `year`, `all` (Default: all)'
      },
      {
        name: 'Wiki',
        value:
          'Read the [wiki](https://github.com/dxnter/lasty/wiki/Commands) for additional help and examples'
      }
    ])
    .setColor('#E31C23');
};
