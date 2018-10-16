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
    all: 'overall'
  };

  switch (args[0]) {
    case 'help': {
      return message.channel.send(
        new Discord.RichEmbed()
          .addField(
            'Last.FM Commands',
            'Run commands with prefix `,lf`. Set username with `,lf set`'
          )
          .addField(
            'set - Set Last.FM username.',
            'Example: `,lf set iiMittens`'
          )
          .addField(
            'delete - Deletes your Last.FM username',
            'Alternate: `reset`'
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
        'Please set your Last.FM username with `,lf set [username]`\nNo account? Sign up: https://www.last.fm/join'
      );
    }

    case 'recent': {
      if (!fmUser) {
        return message.channel.send(
          `Last.FM username not set, enter \`,lf set [username]\` or enter a username after \`${
            args[0]
          }\``
        );
      }

      const GET_RECENT_TRACKS = 'user.getRecentTracks';
      const TRACKS_QUERY_STRING = `&user=${fmUser}&api_key=${LASTFM_API_KEY}&limit=10&format=json`;
      const recentTracksRequestURL = `${LASTFM_API_URL}${GET_RECENT_TRACKS}${TRACKS_QUERY_STRING}`;

      return axios
        .get(recentTracksRequestURL)
        .then(recentTracksRes => {
          const recentTracks = recentTracksRes.data.recenttracks.track.map(
            (track, i) => {
              const {
                artist: { '#text': artist },
                name: song,
                url
              } = track;
              return `\`${i + 1}\` **[${song}](${url.replace(
                ')',
                '\\)'
              )})** by **${artist}**`;
            }
          );

          return message.channel.send(
            new Discord.RichEmbed()
              .setAuthor(`${fmUser}'s Recent Tracks`)
              .setDescription(recentTracks)
              .setColor('#E31C23')
          );
        })
        .catch(e =>
          message.channel.send(`No Last.FM data availible for ${fmUser}`)
        );
    }

    case 'tracks': {
      if (!fmUser) {
        return message.channel.send(
          `Last.FM username not set, enter \`,lf set [username]\` or enter a username after \`${
            args[0]
          }\``
        );
      }
      if (period) {
        if (!PERIOD_PARMS[period]) {
          return message.channel.send(
            `Invalid period: **${period}**\nPeriods:  \`week\`, \`month\`, \`90\`, \`180\`, \`year\`, \`all\` (Default: all)`
          );
        }
      }
      const GET_TOP_TRACKS = 'user.getTopTracks';
      const TOP_TRACKS_QUERY_STRING = `&user=${fmUser}&period=${
        PERIOD_PARMS[period]
      }&api_key=${LASTFM_API_KEY}&limit=10&format=json`;
      const topTracksRequestURL = `${LASTFM_API_URL}${GET_TOP_TRACKS}${TOP_TRACKS_QUERY_STRING}`;

      return axios
        .get(topTracksRequestURL)
        .then(topTracksRes => {
          const topTracks = topTracksRes.data.toptracks.track.map(track => {
            const {
              artist: { name: artist },
              name: song,
              playcount,
              url
            } = track;
            return `\`${playcount} ▶️\` • **[${song}](${url.replace(
              ')',
              '\\)'
            )})** by **${artist}**`;
          });

          return message.channel.send(
            new Discord.RichEmbed()
              .setAuthor(
                `${fmUser}'s Top Tracks for time period of ${
                  period ? PERIOD_PARMS[period] : 'overall'
                }`
              )
              .setDescription(topTracks)
              .setColor('#E31C23')
          );
        })
        .catch(e =>
          message.channel.send(`No Last.FM data availible for ${fmUser}`)
        );
    }

    case 'artists': {
      if (!fmUser) {
        return message.channel.send(
          `Last.FM username not set, enter \`,lf set [username]\` or enter a username after \`${
            args[0]
          }\``
        );
      }
      if (period) {
        if (!PERIOD_PARMS[period]) {
          return message.channel.send(
            `Invalid period: **${period}**\nPeriods:  \`week\`, \`month\`, \`90\`, \`180\`, \`year\`, \`all\` (Default: all)`
          );
        }
      }
      const GET_TOP_ARTISTS = 'user.getTopArtists';
      const TOP_ARTISTS_QUERY_STRING = `&user=${fmUser}&period=${
        PERIOD_PARMS[period]
      }&api_key=${LASTFM_API_KEY}&limit=10&format=json`;
      const topArtistsRequestURL = `${LASTFM_API_URL}${GET_TOP_ARTISTS}${TOP_ARTISTS_QUERY_STRING}`;

      return axios
        .get(topArtistsRequestURL)
        .then(topArtistsRes => {
          const topArtists = topArtistsRes.data.topartists.artist.map(
            artistRes => {
              const { name: artist, playcount, url } = artistRes;
              return `\`${playcount} ▶️\`•  **[${artist}](${url.replace(
                ')',
                '\\)'
              )})**`;
            }
          );
          return message.channel.send(
            new Discord.RichEmbed()
              .setAuthor(
                `${fmUser}'s Top Artists for time period of ${
                  period ? PERIOD_PARMS[period] : 'overall'
                }`
              )
              .setDescription(topArtists)
              .setColor('#E31C23')
          );
        })
        .catch(e =>
          message.channel.send(`No Last.FM data availible for ${fmUser}`)
        );
    }

    case 'albums': {
      if (!fmUser) {
        return message.channel.send(
          `Last.FM username not set, enter \`,lf set [username]\` or enter a username after \`${
            args[0]
          }\``
        );
      }
      if (period) {
        if (!PERIOD_PARMS[period]) {
          return message.channel.send(
            `Invalid period: **${period}**\nPeriods:  \`week\`, \`month\`, \`90\`, \`180\`, \`year\`, \`all\` (Default: all)`
          );
        }
      }
      const GET_TOP_ALBUMS = 'user.getTopAlbums';
      const TOP_ALBUMS_QUERY_STRING = `&user=${fmUser}&period=${
        PERIOD_PARMS[period]
      }&api_key=${LASTFM_API_KEY}&limit=10&format=json`;
      const topAlbumsRequestURL = `${LASTFM_API_URL}${GET_TOP_ALBUMS}${TOP_ALBUMS_QUERY_STRING}`;

      return axios
        .get(topAlbumsRequestURL)
        .then(albumsRes => {
          const topAlbums = albumsRes.data.topalbums.album.map(topAlbumsRes => {
            const {
              name: albumName,
              playcount,
              url: albumURL,
              artist: { name: artistName, url: artistURL }
            } = topAlbumsRes;
            return `\`${playcount} ▶️\`•  **[${albumName}](${albumURL.replace(
              ')',
              '\\)'
            )})** by **[${artistName}](${artistURL.replace(')', '\\)')})**`;
          });
          return message.channel.send(
            new Discord.RichEmbed()
              .setAuthor(
                `${fmUser}'s Top Albums for time period of ${
                  period ? PERIOD_PARMS[period] : 'overall'
                }`
              )
              .setDescription(topAlbums)
              .setColor('#E31C23')
          );
        })
        .catch(e =>
          message.channel.send(`No Last.FM data availible for ${fmUser}`)
        );
    }

    case 'topalbums': {
      const artist = args.slice(1).join(' ');
      const ARTIST_GET_TOP_ALBUMS = 'artist.getTopAlbums';
      const TOP_ALBUMS_QUERY_STRING = `&artist=${artist}&api_key=${LASTFM_API_KEY}&limit=10&autocorrect=1&format=json`;
      const artistTopAlbumsRequestURL = `${LASTFM_API_URL}${ARTIST_GET_TOP_ALBUMS}${TOP_ALBUMS_QUERY_STRING}`;

      return axios
        .get(artistTopAlbumsRequestURL)
        .then(topAlbumsRes => {
          const formattedArtist = topAlbumsRes.data.topalbums['@attr'].artist;
          const artistURL = topAlbumsRes.data.topalbums.album[0].artist.url;
          const artistTopAlbums = topAlbumsRes.data.topalbums.album.map(
            (album, i) => {
              const { name, playcount, url: albumURL } = album;
              return `\`${i + 1}\` **[${name}](${albumURL.replace(
                ')',
                '\\)'
              )})** • \`${playcount.toLocaleString()} ▶\`  ️`;
            }
          );
          return message.channel.send(
            new Discord.RichEmbed()
              .setAuthor(`${formattedArtist}'s Top 10 Albums`, null, artistURL)
              .setDescription(artistTopAlbums)
              .setColor('#E31C23')
          );
        })
        .catch(e => {
          console.log(e);
          message.channel.send(`No data availible for ${artist}`);
        });
    }

    default: {
      return message.channel.send('Invalid command, try `,lf help`');
    }
  }
};

module.exports.help = {
  name: 'lf'
};
