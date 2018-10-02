const Discord = require('discord.js');
const axios = require('axios');

const { LASTFM_API_KEY } = process.env;
const LASTFM_API_URL = 'http://ws.audioscrobbler.com/2.0/?method=';

module.exports.run = async (bot, message, args) => {
  const fmUser = args[1];
  const period = args[2];

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
          .addField('np - Shows currently playing song. (Without `,lf` prefix)', 'Example: `,np` or `,np iiMittens`')
          .addField('recent - Shows recent tracks.', 'Alternate: lp, last')
          .addBlankField(true)
          .addField('Command Paramaters', '`week`, `month`, `90`, `180`, `year`, `all` (Default: all)')
          .addField('tracks - Shows most played tracks', 'Example: `,lf tracks iiMittens month`')
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
      axios.get(tracksRequestURL).then(recentTracksRes => {
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
      });
      break;
    }

    case 'tracks': {
      const GET_TOP_TRACKS = 'user.getTopTracks';
      const TOP_TRACKS_QUERY_STRING = `&user=${fmUser}&period=${
        PERIOD_PARMS[period]
      }&api_key=${LASTFM_API_KEY}&limit=10&format=json`;
      const topTracksRequestURL = `${LASTFM_API_URL}${GET_TOP_TRACKS}${TOP_TRACKS_QUERY_STRING}`;

      let topTracksStr = '';
      axios.get(topTracksRequestURL).then(topTracksRes => {
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
      });
      break;
    }

    case 'artists': {
      const GET_TOP_ARTISTS = 'user.getTopArtists';
      const TOP_ARTISTS_QUERY_STRING = `&user=${fmUser}&period=${
        PERIOD_PARMS[period]
      }&api_key=${LASTFM_API_KEY}&limit=10&format=json`;
      const topArtistsRequestURL = `${LASTFM_API_URL}${GET_TOP_ARTISTS}${TOP_ARTISTS_QUERY_STRING}`;

      let topArtistsStr = '';
      axios.get(topArtistsRequestURL).then(topArtists => {
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
