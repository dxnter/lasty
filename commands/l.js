import Discord from 'discord.js';
import {
  fetchUserInfo,
  fetch10RecentTracks,
  fetchUsersTopTracks,
  fetchUsersTopArtists,
  fetchUsersTopAlbums,
  fetchArtistTopAlbums
} from '../api/lastfm';
import db from '../db';
import { Util } from '../utils/util';

module.exports.run = async (bot, message, args) => {
  const dbUser = db
    .get('users')
    .find({ userID: message.author.id })
    .value();
  let fmUser = args[1];
  let period = args[2];
  if (dbUser && args[0] !== 'set') {
    fmUser = dbUser.lastFM;
    period = args[1];
  }
  if (args.length === 3) {
    fmUser = args[1];
    period = args[2];
  }

  switch (args[0]) {
    case 'help': {
      return message.channel.send(
        new Discord.RichEmbed()
          .setTitle('Last.f, Commands')
          .addField(
            'set - Sets Last.fm username.',
            'Example: `,l set iiMittens`'
          )
          .addField(
            'delete - Deletes saved Last.fm username',
            'Alternate: `reset`'
          )
          .addField(
            'info - Shows Last.FM account information',
            'Example: `,l info`'
          )
          .addField(
            'np - Shows currently playing song. (Without `,l` prefix)',
            'Example: `,np` or `,np iiMittens`'
          )
          .addField(
            'recent - Shows 10 most recent tracks played.',
            'Alternate: None'
          )
          .addBlankField(true)
          .addField(
            'Command Paramaters',
            '`week`, `month`, `90`, `180`, `year`, `all` (Default: all)\n**Username can be omitted if set with** `,l set`\n'
          )
          .addField(
            'tracks - Shows most played tracks',
            'Example: `,l tracks iiMittens month`'
          )
          .addField(
            'artists - Shows most listened artists',
            'Example: `,l artists week`'
          )
          .addField(
            'albums - Shows most played albums',
            'Example: `,l albums Reversibly 90`'
          )
          .setColor('#E31C23')
      );
    }

    case 'set': {
      const existingUser = db
        .get('users')
        .find({ userID: message.author.id })
        .value();

      if (existingUser) {
        if (existingUser.lastFM === fmUser) {
          return Util.replyEmbedMessage(
            message,
            args,
            'USER_EXISTS',
            null,
            fmUser
          );
        }
        existingUser.lastFM = fmUser;
        db.get('users')
          .find({ userID: message.author.id })
          .assign({ lastFM: fmUser })
          .write();
        return Util.replyEmbedMessage(
          message,
          args,
          'USER_UPDATED',
          null,
          fmUser
        );
      }
      db.get('users')
        .push({ userID: message.author.id, lastFM: fmUser })
        .write();
      return Util.replyEmbedMessage(message, args, 'USER_SET', null, fmUser);
    }

    case 'info': {
      const existingUser = db
        .get('users')
        .find({ userID: message.author.id })
        .value();

      if (!existingUser) {
        return message.channel.send(
          `<@${message.author.id}>, Please set your Last.fm username with \`,lf set <username>\`\nNo account? Sign up: https://www.last.fm/join`
        );
      }
      const {
        totalScrobbles,
        name,
        profileURL,
        country,
        image,
        unixRegistration
      } = await fetchUserInfo(fmUser);
      const lastFMAvatar = image[2]['#text'];

      return message.channel.send(
        new Discord.RichEmbed()
          .setAuthor(name, lastFMAvatar, profileURL)
          .setThumbnail(lastFMAvatar)
          .addField('Total Scrobbes', Number(totalScrobbles).toLocaleString())
          .addField('Country', country)
          .addField(
            'Registration Date',
            new Date(unixRegistration * 1000).toLocaleString()
          )
          .setColor('#E31C23')
      );
    }

    case 'delete':
    case 'reset': {
      const existingUser = db
        .get('users')
        .find({ userID: message.author.id })
        .value();

      if (existingUser) {
        db.get('users')
          .remove({ userID: message.author.id })
          .write();
        return message.channel.send(
          `**${existingUser.lastFM}** has been deleted from the database`
        );
      }
      return message.channel.send(
        new Discord.RichEmbed()
          .setAuthor('⚠️ Error')
          .setDescription(
            `Last.fm username not set, enter \`,l set <username>\``
          )
          .setColor('#E31C23')
      );
    }

    case 'recent': {
      const { author, description, error } = await fetch10RecentTracks(
        fmUser,
        message,
        args
      );
      if (error) {
        return Util.replyEmbedMessage(message, args, error, period, fmUser);
      }

      return message.channel.send(
        new Discord.RichEmbed()
          .setAuthor(
            author,
            message.author.avatarURL,
            `http://www.last.fm/user/${fmUser}`
          )
          .setDescription(description)
          .setColor('#E31C23')
      );
    }

    case 'tracks': {
      const { author, description, error } = await fetchUsersTopTracks(
        fmUser,
        period,
        message,
        args
      );
      if (error) {
        return Util.replyEmbedMessage(message, args, error, period, fmUser);
      }

      return message.channel.send(
        new Discord.RichEmbed()
          .setAuthor(
            author,
            message.author.avatarURL,
            `http://www.last.fm/user/${fmUser}`
          )
          .setDescription(description)
          .setColor('#E31C23')
      );
    }

    case 'artists': {
      const { author, description, error } = await fetchUsersTopArtists(
        fmUser,
        period,
        message,
        args
      );
      if (error) {
        return Util.replyEmbedMessage(message, args, error, period, fmUser);
      }

      return message.channel.send(
        new Discord.RichEmbed()
          .setAuthor(
            author,
            message.author.avatarURL,
            `http://www.last.fm/user/${fmUser}`
          )
          .setDescription(description)
          .setColor('#E31C23')
      );
    }

    case 'albums': {
      const { author, description, error } = await fetchUsersTopAlbums(
        fmUser,
        period,
        message,
        args
      );
      if (error) {
        return Util.replyEmbedMessage(message, args, error, period, fmUser);
      }

      return message.channel.send(
        new Discord.RichEmbed()
          .setAuthor(
            author,
            message.author.avatarURL,
            `http://www.last.fm/user/${fmUser}`
          )
          .setDescription(description)
          .setColor('#E31C23')
      );
    }

    case 'topalbums': {
      const {
        author,
        description,
        artistURL,
        error
      } = await fetchArtistTopAlbums(message, args);
      if (error) {
        return Util.replyEmbedMessage(message, args, error);
      }
      return message.channel.send(
        new Discord.RichEmbed()
          .setAuthor(author, null, artistURL)
          .setDescription(description)
          .setColor('#E31C23')
      );
    }

    default: {
      return message.channel.send(
        `<@${message.author.id}>, Invalid command, try \`,l help\``
      );
    }
  }
};

module.exports = {
  name: 'l'
};
