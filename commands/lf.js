const Discord = require('discord.js');
const axios = require('axios');
const mongoose = require('mongoose');
const chalk = require('chalk');
const User = require('../models/user');

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
    all: 'overall',
  };

  switch (args[0]) {
    case 'help': {
      return message.channel.send(
        new Discord.RichEmbed()
          .setColor('#E31C23')
          .addField('Last.FM Commands', 'Run commands with prefix `,lf`. Set username with `,lf set`')
          .addField('set - Set Last.FM username.', 'Example: `,lf set iiMittens`')
          .addField("delete - Deletes your Last.FM username from Lasty's database", 'Alternate: `reset`')
          .addField('np - Shows currently playing song. (Without `,lf` prefix)', 'Example: `,np` or `,np iiMittens`')
          .addField('recent - Shows 10 most recent tracks played.', 'Alternate: None')
          .addBlankField(true)
          .addField(
            'Command Paramaters',
            '`week`, `month`, `90`, `180`, `year`, `all` (Default: all)\n**Username can be omitted if set with** `,lf set`\n'
          )
          .addField('tracks - Shows most played tracks', 'Example: `,lf tracks iiMittens month`')
          .addField('artists - Shows most listened artists', 'Example: `,lf artists dluxxe week`')
          .addField('albums - Shows most played albums', 'Example: `,lf albums Reversibly 90`')
      );
    }

    case 'set': {
      const existingUser = await User.findOne({ userID: message.author.id });
      if (existingUser) {
        if (existingUser.lastFM === fmUser) {
          return message.channel.send(`Your Last.FM profile is already set to ${fmUser}`);
        }
        existingUser.lastFM = fmUser;
        return existingUser
          .save()
          .then(() => message.channel.send(`Last.FM username updated to ${fmUser}`))
          .catch(console.error);
      }

      const user = new User({
        _id: mongoose.Types.ObjectId(),
        lastFM: fmUser,
        userID: message.author.id,
      });
      return user
        .save()
        .then(() => {
          message.channel.send(`Last.FM username set to ${fmUser}`);
          console.log(user);
        })
        .catch(console.error);
    }

    case 'delete':
    case 'reset': {
      const existingUser = await User.findOne({ userID: message.author.id });
      if (existingUser) {
        return User.deleteOne(existingUser).then(() =>
          message.channel.send(`**${existingUser.lastFM}** has been deleted from the database`)
        );
      }
      return message.channel.send(
        'Please set your Last.FM username with `,lf set [username]`\nNo account? Sign up: https://www.last.fm/join'
      );
    }

    case 'recent': {
      const GET_RECENT_TRACKS = 'user.getRecentTracks';
      const TRACKS_QUERY_STRING = `&user=${fmUser}&api_key=${LASTFM_API_KEY}&limit=10&format=json`;
      const tracksRequestURL = `${LASTFM_API_URL}${GET_RECENT_TRACKS}${TRACKS_QUERY_STRING}`;

      let recentTracks = '';
      return axios
        .get(tracksRequestURL)
        .then(recentTracksRes => {
          recentTracksRes.data.recenttracks.track.forEach((track, i) => {
            const {
              artist: { '#text': artist },
              name: song,
              url,
            } = track;
            recentTracks += `\`${i + 1}\` **[${song}](${url.replace(')', '\\)')})** by **${artist}**\n`;
          });

          return message.channel.send(
            new Discord.RichEmbed()
              .setColor('#E31C23')
              .setAuthor(`${fmUser}'s Recent Tracks`)
              .setDescription(recentTracks)
          );
        })
        .catch(e => message.channel.send(`No Last.FM data availible for ${fmUser}`));
    }

    case 'tracks': {
      const GET_TOP_TRACKS = 'user.getTopTracks';
      const TOP_TRACKS_QUERY_STRING = `&user=${fmUser}&period=${
        PERIOD_PARMS[period]
      }&api_key=${LASTFM_API_KEY}&limit=10&format=json`;
      const topTracksRequestURL = `${LASTFM_API_URL}${GET_TOP_TRACKS}${TOP_TRACKS_QUERY_STRING}`;

      let topTracksStr = '';
      return axios
        .get(topTracksRequestURL)
        .then(topTracksRes => {
          topTracksRes.data.toptracks.track.forEach(track => {
            const {
              artist: { name: artist },
              name: song,
              playcount,
              url,
            } = track;
            topTracksStr += `\`${playcount} ▶️\` • **[${song}](${url.replace(')', '\\)')})** by **${artist}**\n`;
          });

          return message.channel.send(
            new Discord.RichEmbed()
              .setColor('#E31C23')
              .setAuthor(`${fmUser}'s Top Tracks for time period of ${period ? PERIOD_PARMS[period] : 'overall'}`)
              .setDescription(topTracksStr)
          );
        })
        .catch(e => message.channel.send(`No Last.FM data availible for ${fmUser}`));
    }

    case 'artists': {
      const GET_TOP_ARTISTS = 'user.getTopArtists';
      const TOP_ARTISTS_QUERY_STRING = `&user=${fmUser}&period=${
        PERIOD_PARMS[period]
      }&api_key=${LASTFM_API_KEY}&limit=10&format=json`;
      const topArtistsRequestURL = `${LASTFM_API_URL}${GET_TOP_ARTISTS}${TOP_ARTISTS_QUERY_STRING}`;

      let topArtistsStr = '';
      return axios
        .get(topArtistsRequestURL)
        .then(topArtists => {
          topArtists.data.topartists.artist.forEach(artistRes => {
            const { name: artist, playcount, url } = artistRes;
            topArtistsStr += `\`${playcount} ▶️\`•  **[${artist}](${url.replace(')', '\\)')})**\n`;
          });
          return message.channel.send(
            new Discord.RichEmbed()
              .setColor('#E31C23')
              .setAuthor(`${fmUser}'s Top Artists for time period of ${period ? PERIOD_PARMS[period] : 'overall'}`)
              .setDescription(topArtistsStr)
          );
        })
        .catch(e => message.channel.send(`No Last.FM data availible for ${fmUser}`));
    }

    case 'albums': {
      const GET_TOP_ALBUMS = 'user.getTopAlbums';
      const TOP_ALBUMS_QUERY_STRING = `&user=${fmUser}&period=${
        PERIOD_PARMS[period]
      }&api_key=${LASTFM_API_KEY}&limit=10&format=json`;
      const topAlbumsRequestURL = `${LASTFM_API_URL}${GET_TOP_ALBUMS}${TOP_ALBUMS_QUERY_STRING}`;

      let topAlbumsStr = '';
      return axios
        .get(topAlbumsRequestURL)
        .then(albumsRes => {
          albumsRes.data.topalbums.album.forEach(albumData => {
            const {
              name: albumName,
              playcount,
              url: albumURL,
              artist: { name: artistName, url: artistURL },
            } = albumData;
            topAlbumsStr += `\`${playcount} ▶️\`•  **[${albumName}](${albumURL.replace(
              ')',
              '\\)'
            )})** by **[${artistName}](${artistURL.replace(')', '\\)')})**\n`;
          });
          return message.channel.send(
            new Discord.RichEmbed()
              .setColor('#E31C23')
              .setAuthor(`${fmUser}'s Top Albums for time period of ${period ? PERIOD_PARMS[period] : 'overall'}`)
              .setDescription(topAlbumsStr)
          );
        })
        .catch(e => message.channel.send(`No Last.FM data availible for ${fmUser}`));
    }

    default: {
      return message.channel.send('Invalid command, try `,lf help`');
    }
  }
};

module.exports.help = {
  name: 'lf',
};
