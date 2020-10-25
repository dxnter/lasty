import Discord from 'discord.js';
import db from '../db';
import {
  ERROR,
  SUCCESS,
  READABLE_PERIODS,
  USER_UNDEFINED,
  USER_UNDEFINED_ARGS,
  USER_UNDEFINED_ALBUM_ARGS,
  USER_SET,
  USER_EXISTS,
  USER_UPDATED,
  USER_DELETED,
  USER_UNSUBSCRIBED,
  USER_ALREADY_SUBSCRIBED,
  USER_ALREADY_UNSUBSCRIBED,
  USER_UNREGISTERED,
  ARTIST_UNDEFINED,
  ALBUM_UNDEFINED,
  ALBUM_INVALID,
  ARTIST_NOT_FOUND,
  ARTIST_INVALID,
  PERIOD_INVALID,
  EMPTY_LISTENING_DATA,
  TRACK_NOT_FOUND,
  PERMISSION_INVALID,
  COMMAND_INVALID,
  USER_SUBSCRIBED
} from '../constants';

export const userInDatabase = userID => {
  const dbUser = db
    .get('users')
    .find({ userID })
    .value();
  if (!dbUser) {
    return false;
  }
  return dbUser.fmUser;
};

export const findExistingUser = userID => {
  return db
    .get('users')
    .find({ userID })
    .value();
};

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

export const createEmbedMessage = (status, statusDescription) => {
  return new Discord.MessageEmbed()
    .setAuthor(status === SUCCESS ? '✅ Success' : '❌ Error')
    .setDescription(statusDescription)
    .setColor('#E31C23');
};

export const replyEmbedMessage = (
  msg,
  commandName,
  statusDescription,
  { period, fmUser, artist, albumName } = {}
) => {
  switch (statusDescription) {
    case USER_UNDEFINED_ARGS:
      return msg.say(
        createEmbedMessage(
          ERROR,
          `Last.fm username not set, enter \`,set <lastFMUsername>\` or enter a username after \`${commandName}\``
        )
      );
    case USER_UNDEFINED_ALBUM_ARGS:
      return msg.say(
        createEmbedMessage(
          ERROR,
          `Last.fm username not set, enter \`,set <lastFMUsername>\` or enter an album name after \`${commandName}\``
        )
      );
    case USER_UNDEFINED:
      return msg.say(
        createEmbedMessage(
          ERROR,
          `Last.fm username not set, enter \`,set <lastFMUsername>\``
        )
      );
    case USER_SET:
      return msg.say(
        createEmbedMessage(SUCCESS, `Last.fm username set to **${fmUser}**`)
      );
    case USER_EXISTS:
      return msg.say(
        createEmbedMessage(
          ERROR,
          `Last.fm username is already set to **${fmUser}**`
        )
      );
    case USER_UPDATED:
      return msg.say(
        createEmbedMessage(SUCCESS, `Last.fm username updated to **${fmUser}**`)
      );
    case USER_DELETED:
      return msg.say(
        createEmbedMessage(
          SUCCESS,
          `**${fmUser}** has been deleted from the database`
        )
      );
    case USER_SUBSCRIBED:
      return msg.say(
        createEmbedMessage(SUCCESS, 'Subscribed to the Weekly Recap!')
      );
    case USER_UNSUBSCRIBED:
      return msg.say(
        createEmbedMessage(SUCCESS, 'Unsubscribed from the Weekly Recap!')
      );
    case USER_ALREADY_SUBSCRIBED:
      return msg.say(
        createEmbedMessage(
          ERROR,
          'You are already subscribed to the Weekly Recap!'
        )
      );
    case USER_ALREADY_UNSUBSCRIBED:
      return msg.say(
        createEmbedMessage(
          ERROR,
          'You are already unsubscribed to the Weekly Recap!'
        )
      );
    case USER_UNREGISTERED:
      return msg.say(
        createEmbedMessage(
          ERROR,
          `**${fmUser}** is not a registered Last.fm user`
        )
      );
    case ALBUM_UNDEFINED:
      return msg.say(
        createEmbedMessage(
          ERROR,
          `Enter the name of an album after \`${commandName}\``
        )
      );
    case ALBUM_INVALID:
      return msg.say(
        createEmbedMessage(ERROR, `No album found for **${albumName}**`)
      );
    case ARTIST_UNDEFINED:
      return msg.say(
        createEmbedMessage(
          ERROR,
          `Enter the name of an artist after \`${commandName}\``
        )
      );
    case ARTIST_INVALID:
      return msg.say(
        createEmbedMessage(ERROR, `No albums found for **${artist}**`)
      );
    case ARTIST_NOT_FOUND:
      return msg.say(
        createEmbedMessage(ERROR, `No artist found named **${artist}**`)
      );
    case PERIOD_INVALID:
      return msg.say(
        createEmbedMessage(
          ERROR,
          `Invalid period: **${period}**\nPeriods:  \`week\`, \`month\`, \`90\`, \`180\`, \`year\`, \`all\` (Default: all)`
        )
      );
    case EMPTY_LISTENING_DATA:
      return msg.say(
        createEmbedMessage(
          ERROR,
          `**${fmUser}** hasn't listened to anything recently...`
        )
      );
    case TRACK_NOT_FOUND:
      return msg.say(createEmbedMessage(ERROR, `Track not found on Last.fm!`));

    case PERMISSION_INVALID:
      return msg.say(
        createEmbedMessage(ERROR, `You do not have permission to do that`)
      );
    case COMMAND_INVALID:
      return msg.say(
        createEmbedMessage(ERROR, `Invalid command, try \`,l help\``)
      );
  }
};
