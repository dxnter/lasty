const Discord = require('discord.js');
const axios = require('axios');

const { LASTFM_API_KEY } = process.env;
const LASTFM_API_URL = 'http://ws.audioscrobbler.com/2.0/?method=';

module.exports.run = async (bot, message, args) => {
  switch (args[0]) {
    case 'last':
    case 'lp':
    case 'recent': {
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
    case 'help': {
      return message.channel.send(
        new Discord.RichEmbed()
          .setColor('#E31C23')
          .addField('Last.FM Commands', 'Run commands with prefix `,lf`. Set username with `,lf set`')
          .addField('set - Set Last.FM username.', 'Example: `,lf set iiMittens`')
          .addField(
            'np - Shows currently playing song. (User by default, @mention for others)',
            'Example: `,np` or `,np <@username>`'
          )
          .addField('recent - Shows recent tracks.', 'Alternate: lp, last')
        // top tracks
        // top artists
        // top albums
        // collage
        // serverboard - defaults top 10 thumbs up &
      );
    }
    default: {
      return message.channel.send('Invalid command, try `,lf help`');
    }
  }
};

module.exports.help = {
  name: 'lf',
};
