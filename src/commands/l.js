import Discord from 'discord.js';
import db from '../db';
import { replyEmbedMessage } from '../utils';
import {
  fetchUserInfo,
  fetch10RecentTracks,
  fetchUsersTopTracks,
  fetchUsersTopArtists,
  fetchUsersTopAlbums,
  fetchArtistTopAlbums,
  fetchArtistInfo
} from '../api/lastfm';
import {
  USER_EXISTS,
  USER_UPDATED,
  USER_UNDEFINED,
  USER_UNDEFINED_ARGS,
  USER_DELETED,
  USER_SET,
  COMMAND_INVALID
} from '../constants';

module.exports = {
  name: 'l',
  run: async (bot, message, args) => {
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
    if (!dbUser && args[0] === 'artist') {
      fmUser = undefined;
    }
    if (dbUser && args[0] === 'artist') {
      fmUser = dbUser.lastFM;
    }

    switch (args[0]) {
      case 'help': {
        return message.channel.send(
          new Discord.MessageEmbed()
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
                name: '\u200b',
                value: '\u200b'
              },
              {
                name: 'Command Paramaters',
                value:
                  '`week`, `month`, `90`, `180`, `year`, `all` (Default: all)'
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
            .setColor('#E31C23')
        );
      }

      case 'set': {
        if (!fmUser) {
          return replyEmbedMessage(message, args, USER_UNDEFINED);
        }

        const existingUser = db
          .get('users')
          .find({ userID: message.author.id })
          .value();

        if (existingUser) {
          if (existingUser.lastFM === fmUser) {
            return replyEmbedMessage(message, args, USER_EXISTS, {
              fmUser
            });
          }
          existingUser.lastFM = fmUser;
          db.get('users')
            .find({ userID: message.author.id })
            .assign({ lastFM: fmUser })
            .write();
          return replyEmbedMessage(message, args, USER_UPDATED, {
            fmUser
          });
        }

        db.get('users')
          .push({ userID: message.author.id, lastFM: fmUser })
          .write();
        return replyEmbedMessage(message, args, USER_SET, { fmUser });
      }

      case 'info': {
        const existingUser = db
          .get('users')
          .find({ userID: message.author.id })
          .value();

        if (!existingUser && !fmUser) {
          return replyEmbedMessage(message, args, USER_UNDEFINED_ARGS);
        }

        if (args[1]) {
          fmUser = args[1];
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
          new Discord.MessageEmbed()
            .setAuthor(name, lastFMAvatar, profileURL)
            .setThumbnail(lastFMAvatar)
            .addField('Total Scrobbes', totalScrobbles)
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
          return replyEmbedMessage(message, null, USER_DELETED, {
            fmUser
          });
        }

        return replyEmbedMessage(message, args, USER_UNDEFINED);
      }

      case 'recent': {
        const { author, description, error } = await fetch10RecentTracks(
          fmUser,
          message,
          args
        );
        if (error) {
          return replyEmbedMessage(message, args, error, { fmUser });
        }

        return message.channel.send(
          new Discord.MessageEmbed()
            .setAuthor(
              author,
              message.author.avatarURL({ dynamic: true }),
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
          return replyEmbedMessage(message, args, error, {
            period,
            fmUser
          });
        }

        return message.channel.send(
          new Discord.MessageEmbed()
            .setAuthor(
              author,
              message.author.avatarURL({ dynamic: true }),
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
          return replyEmbedMessage(message, args, error, {
            period,
            fmUser
          });
        }

        return message.channel.send(
          new Discord.MessageEmbed()
            .setAuthor(
              author,
              message.author.avatarURL({ dynamic: true }),
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
          return replyEmbedMessage(message, args, error, {
            period,
            fmUser
          });
        }

        return message.channel.send(
          new Discord.MessageEmbed()
            .setAuthor(
              author,
              message.author.avatarURL({ dynamic: true }),
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
          error,
          artist
        } = await fetchArtistTopAlbums(args);
        if (error) {
          return replyEmbedMessage(message, args, error, { artist });
        }

        return message.channel.send(
          new Discord.MessageEmbed()
            .setAuthor(author, null, artistURL)
            .setDescription(description)
            .setColor('#E31C23')
        );
      }

      case 'artist': {
        const {
          artistName,
          artistURL,
          totalListeners,
          totalPlays,
          userPlays,
          similarArtistsString,
          biography,
          error,
          artist
        } = await fetchArtistInfo(args, fmUser);
        if (error) {
          return replyEmbedMessage(message, args, error, { artist });
        }

        return message.channel.send(
          new Discord.MessageEmbed()
            .setAuthor(artistName, null, artistURL)
            .addField('Listeners', totalListeners, true)
            .addField('Total Plays', totalPlays, true)
            .addField('Your plays', userPlays, true)
            .addField('Summary', biography)
            .addField('Similar Artists', similarArtistsString)
            .setColor('#E31C23')
        );
      }

      default: {
        return replyEmbedMessage(message, args, COMMAND_INVALID);
      }
    }
  }
};
