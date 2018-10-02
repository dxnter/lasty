const Discord = require('discord.js');
const axios = require('axios');

const { LASTFM_API_KEY } = process.env;
const LASTFM_API_URL = 'http://ws.audioscrobbler.com/2.0/?method=';

module.exports.run = async (bot, message, args) => {
  switch (args[0]) {
    case 'help': {
      return message.channel.send(
        new Discord.RichEmbed()
          .setColor('#E31C23')
          .addField('Last.FM Commands', 'Run commands with prefix `,lf`. Set username with `,lf set`')
          .addField('set - Set Last.FM username.', 'Example: `,lf set iiMittens`')
          .addField('np - Shows currently playing song. (Without `,lf` prefix)', 'Example: `,np` or `,np iiMittens`')
          .addField('recent - Shows recent tracks.', 'Alternate: lp, last')
          .addField('tracks - Shows most played tracks', 'Alternate: toptracks, ttr')
          .addField('artists - Shows most listened artists', 'Alternate: topartists')
          .addField('albums - Shows most played albums', 'Alternate: albums, tab')
      );
    }

    case 'recent':
    case 'last':
    case 'lp': {
      const fmUser = args[1];
      const GET_RECENT_TRACKS = 'user.getRecentTracks';
      const TRACKS_QUERY_STRING = `&user=${fmUser}&api_key=${LASTFM_API_KEY}&limit=10&format=json`;
      const tracksRequestURL = `${LASTFM_API_URL}${GET_RECENT_TRACKS}${TRACKS_QUERY_STRING}`;

      let recentTracks = '';
      axios.get(tracksRequestURL).then(tracksRes => {
        tracksRes.data.recenttracks.track.forEach((track, i) => {
          const {
            artist: { '#text': artist },
            name: song,
            url,
          } = track;
          recentTracks += `\`${i + 1}\` **[${song}](${url.replace(')', '\\)')})** by **${artist}**\n`;
        });

        return message.channel.send(
          new Discord.RichEmbed().setAuthor(`${fmUser}'s Recent Tracks`).setDescription(recentTracks)
        );
      });
      break;
    }

    case 'tracks':
    case 'toptracks':
    case 'ttr': {
      const fmUser = args[1];
      const GET_TOP_TRACKS = 'user.getTopTracks';
      const TOP_TRACKS_QUERY_STRING = `&user=${fmUser}&api_key=${LASTFM_API_KEY}&limit=10&format=json`;
      const topTracksRequestURL = `${LASTFM_API_URL}${GET_TOP_TRACKS}${TOP_TRACKS_QUERY_STRING}`;

      let topTracksResult = '';
      axios.get(topTracksRequestURL).then(topTracks => {
        topTracks.data.toptracks.track.forEach(track => {
          const {
            artist: { name: artist },
            name: song,
            playcount,
            url,
          } = track;
          topTracksResult += `\`${playcount} ▶️\` • **[${song}](${url.replace(')', '\\)')})** by **${artist}**\n`;
        });

        return message.channel.send(
          new Discord.RichEmbed()
            .setAuthor(`${fmUser}'s Top Tracks for time period of overall`)
            .setDescription(topTracksResult)
        );
      });
      break;
    }

    default: {
      return message.channel.send('Invalid command, try `,lf help`');
    }
  }
};

module.exports.help = {
  name: 'lf',
};
