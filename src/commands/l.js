import Discord from 'discord.js';
import db from '../db';
import { helpMessageEmbed, replyEmbedMessage } from '../utils';
import {
  fetchUserInfo,
  fetch10RecentTracks,
  fetchUsersTopTracks,
  fetchUsersTopArtists,
  fetchUsersTopAlbums,
  fetchArtistTopAlbums,
  fetchArtistTopTracks,
  fetchArtistInfo
} from '../api/lastfm';
import {
  USER_SET,
  USER_UPDATED,
  USER_DELETED,
  USER_EXISTS,
  USER_SUBSCRIBED,
  USER_UNSUBSCRIBED,
  USER_ALREADY_SUBSCRIBED,
  USER_UNREGISTERED,
  USER_UNDEFINED,
  USER_UNDEFINED_ARGS,
  COMMAND_INVALID,
  USER_ALREADY_UNSUBSCRIBED
} from '../constants';

module.exports = {
  name: 'l',
  run: async (bot, message, args) => {
    const dbUser = db
      .get('users')
      .find({ userID: message.author.id })
      .value();
    const artistName = args.slice(1).join(' ');
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
        return message.channel.send(helpMessageEmbed());
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
          db.get('users')
            .find({ userID: message.author.id })
            .assign({ lastFM: fmUser })
            .write();
          return replyEmbedMessage(message, args, USER_UPDATED, {
            fmUser
          });
        }

        db.get('users')
          .push({
            userID: message.author.id,
            lastFM: fmUser,
            isSubscribedWeekly: true
          })
          .write();
        return replyEmbedMessage(message, args, USER_SET, { fmUser });
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

      case 'sub': {
        const existingUser = db
          .get('users')
          .find({ userID: message.author.id })
          .value();
        if (existingUser) {
          if (!existingUser.isSubscribedWeekly) {
            db.get('users')
              .find({ userID: message.author.id })
              .assign({ isSubscribedWeekly: true })
              .write();
            return replyEmbedMessage(message, null, USER_SUBSCRIBED);
          }
          return replyEmbedMessage(message, null, USER_ALREADY_SUBSCRIBED);
        }
        return replyEmbedMessage(message, args, USER_UNDEFINED);
      }

      case 'unsub': {
        const existingUser = db
          .get('users')
          .find({ userID: message.author.id })
          .value();

        if (existingUser) {
          if (existingUser.isSubscribedWeekly) {
            db.get('users')
              .find({ userID: message.author.id })
              .assign({ isSubscribedWeekly: false })
              .write();
            return replyEmbedMessage(message, null, USER_UNSUBSCRIBED);
          }
          return replyEmbedMessage(message, null, USER_ALREADY_UNSUBSCRIBED);
        }
        return replyEmbedMessage(message, args, USER_UNDEFINED);
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

        try {
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
        } catch (err) {
          return replyEmbedMessage(message, args, USER_UNREGISTERED, {
            fmUser
          });
        }
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
        } = await fetchArtistTopAlbums(artistName);
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

      case 'toptracks': {
        const {
          author,
          description,
          artistURL,
          error,
          artist
        } = await fetchArtistTopTracks(artistName);
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
          formattedArtistName,
          artistURL,
          totalListeners,
          totalPlays,
          userPlays,
          similarArtistsString,
          biography,
          error,
          artist
        } = await fetchArtistInfo(artistName, fmUser);
        if (error) {
          return replyEmbedMessage(message, args, error, { artist });
        }

        return message.channel.send(
          new Discord.MessageEmbed()
            .setAuthor(formattedArtistName, null, artistURL)
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
