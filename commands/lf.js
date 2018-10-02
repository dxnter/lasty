const Discord = require('discord.js');

const { LASTFM_API_KEY } = process.env;
const LASTFM_API_URL = 'http://ws.audioscrobbler.com/2.0/?method=';

module.exports.run = async (bot, message, args) => {
  switch (args[0]) {
    case 'last':
    case 'lp':
    case 'recent': {
      console.log('last');
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
