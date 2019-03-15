const Discord = require('discord.js');
const axios = require('axios');
const mongoose = require('mongoose');
const User = require('../models/user');
const {
  getUserInfo,
  get10RecentTracks,
  getUsersTopTracks,
  getUsersTopArtists,
  getUsersTopAlbums,
  getArtistTopAlbums
} = require('../api/lastfm');

const { LASTFM_API_KEY } = process.env;
const LASTFM_API_URL = 'http://ws.audioscrobbler.com/2.0/?method=';

module.exports.run = async (bot, message, args) => {
  let fmUser = args[1];
  let period = args[2];
  const dbUser = await User.findOne({ userID: message.author.id });
  if (dbUser && args[0] !== 'set') {
    fmUser = dbUser.lastFM;
    period = args[1];
  }
  if (args.length === 3) {
    fmUser = args[1];
    period = args[2];
  }

  const PERIOD_PARMS = {
    week: '7day',
    month: '1month',
    '90': '3month',
    '180': '6month',
    year: '12month',
    all: 'overall'
  };

  switch (args[0]) {
    case 'help': {
      return message.channel.send(
        new Discord.RichEmbed()
          .setTitle('Last.FM Commands')
          .addField(
            'set - Sets Last.FM username.',
            'Example: `,lf set iiMittens`'
          )
          .addField(
            'delete - Deletes saved Last.FM username',
            'Alternate: `reset`'
          )
          .addField(
            'info - Shows Last.FM account information',
            'Example: `,lf info`'
          )
          .addField(
            'np - Shows currently playing song. (Without `,lf` prefix)',
            'Example: `,np` or `,np iiMittens`'
          )
          .addField(
            'recent - Shows 10 most recent tracks played.',
            'Alternate: None'
          )
          .addBlankField(true)
          .addField(
            'Command Paramaters',
            '`week`, `month`, `90`, `180`, `year`, `all` (Default: all)\n**Username can be omitted if set with** `,lf set`\n'
          )
          .addField(
            'tracks - Shows most played tracks',
            'Example: `,lf tracks iiMittens month`'
          )
          .addField(
            'artists - Shows most listened artists',
            'Example: `,lf artists dluxxe week`'
          )
          .addField(
            'albums - Shows most played albums',
            'Example: `,lf albums Reversibly 90`'
          )
          .setColor('#E31C23')
      );
    }

    case 'set': {
      const existingUser = await User.findOne({ userID: message.author.id });
      if (existingUser) {
        if (existingUser.lastFM === fmUser) {
          return message.channel.send(
            `Your Last.FM profile is already set to **${fmUser}**`
          );
        }
        existingUser.lastFM = fmUser;
        return existingUser
          .save()
          .then(() =>
            message.channel.send(`Last.FM username updated to **${fmUser}**`)
          )
          .catch(console.error);
      }

      const user = new User({
        _id: mongoose.Types.ObjectId(),
        lastFM: fmUser,
        userID: message.author.id
      });
      return user
        .save()
        .then(() => {
          message.channel.send(`Last.FM username set to **${fmUser}**`);
          console.log(user);
        })
        .catch(console.error);
    }

    case 'info': {
      const existingUser = await User.findOne({ userID: message.author.id });
      if (!existingUser) {
        return message.channel.send(
          `<@${
            message.author.id
          }>, Please set your Last.FM username with \`,lf set [username]\`\nNo account? Sign up: https://www.last.fm/join`
        );
      }
      const {
        totalScrobbles,
        name,
        profileURL,
        country,
        image,
        unixRegistration
      } = await getUserInfo(fmUser);
      const lastFMAvatar = image[1]['#text'];

      return message.channel.send(
        new Discord.RichEmbed()
          .setAuthor(name, lastFMAvatar, profileURL)
          .addField('Total Scrobbes', totalScrobbles.toLocaleString())
          .addField('Country', country)
          .addField('Registration Date', new Date(unixRegistration * 1000))
          .setColor('#E31C23')
      );
    }

    case 'delete':
    case 'reset': {
      const existingUser = await User.findOne({ userID: message.author.id });
      if (existingUser) {
        return User.deleteOne(existingUser).then(() =>
          message.channel.send(
            `**${existingUser.lastFM}** has been deleted from the database`
          )
        );
      }
      return message.channel.send(
        `<@${
          message.author.id
        }>, Please set your Last.FM username with \`,lf set [username]\`\nNo account? Sign up: https://www.last.fm/join`
      );
    }

    case 'recent': {
      const recentTracks = await get10RecentTracks(fmUser, message, args);
      return message.channel.send(
        new Discord.RichEmbed()
          .setAuthor(`${fmUser}'s Recent Tracks`)
          .setDescription(recentTracks)
          .setColor('#E31C23')
      );
    }

    case 'tracks': {
      const topTracks = await getUsersTopTracks(fmUser, period, message, args);
      return message.channel.send(
        new Discord.RichEmbed()
          .setAuthor(topTracks.author)
          .setDescription(topTracks.description)
          .setColor('#E31C23')
      );
    }

    case 'artists': {
      const topArtists = await getUsersTopArtists(
        fmUser,
        period,
        message,
        args
      );
      if (topArtists.description.length === 0)
        return message.channel.send(
          `<@${
            message.author.id
          }>, You don't have any listening history for that time period!`
        );
      return message.channel.send(
        new Discord.RichEmbed()
          .setAuthor(topArtists.author)
          .setDescription(topArtists.description)
          .setColor('#E31C23')
      );
    }

    case 'albums': {
      const topAlbums = await getUsersTopAlbums(fmUser, period, message, args);
      if (topAlbums.description.length === 0) {
        return message.channel.send(
          `<@${
            message.author.id
          }>, You don't have any listening history for that time period!`
        );
      }
      return message.channel.send(
        new Discord.RichEmbed()
          .setAuthor(topAlbums.author)
          .setDescription(topAlbums.description)
          .setColor('#E31C23')
      );
    }

    case 'topalbums': {
      const {
        artistTopAlbums,
        formattedArtist,
        artistURL
      } = await getArtistTopAlbums(args);
      return message.channel.send(
        new Discord.RichEmbed()
          .setAuthor(`${formattedArtist}'s Top 10 Albums`, null, artistURL)
          .setDescription(artistTopAlbums)
          .setColor('#E31C23')
      );
    }

    default: {
      return message.channel.send(
        `<@${message.author.id}>, Invalid command, try \`,lf help\``
      );
    }
  }
};

module.exports.help = {
  name: 'lf'
};
