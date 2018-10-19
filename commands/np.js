const Discord = require('discord.js');
const axios = require('axios');
const {
  getTotalScrobbles,
  getRecentTrack,
  getArtistScrobbles
} = require('../api/lastfm');
const User = require('../models/user');

module.exports.run = async (bot, message, args) => {
  let [fmUser] = args;
  if (!fmUser) {
    const dbUser = await User.findOne({ userID: message.author.id });
    try {
      fmUser = dbUser.lastFM;
    } catch (e) {
      return message.channel.send(
        `<@${
          message.author.id
        }>, Please set your Last.FM username with \`,lf set [username]\`\nNo account? Sign up: https://www.last.fm/join`
      );
    }
  }

  axios
    .all([
      getTotalScrobbles(fmUser),
      getRecentTrack(fmUser),
      getArtistScrobbles(fmUser)
    ])
    .then(
      axios.spread(
        (
          totalScrobbles,
          { track, artist, album, songUrl, albumCover },
          { url, artistScrobbles }
        ) => {
          const avatarURL = `https://cdn.discordapp.com/avatars/${
            message.author.id
          }/${message.author.avatar}`;

          const embed = new Discord.RichEmbed()
            .setAuthor(
              `Last.FM: ${fmUser}`,
              avatarURL,
              `http://www.last.fm/user/${fmUser}`
            )
            .setThumbnail(albumCover)
            .addField(
              'Track',
              `[${track}](${songUrl.replace(')', '\\)')})`,
              true
            )
            .addField('Artist', `[${artist}](${url})`, true)
            .setFooter(
              `${artist} Scrobbles: ${artistScrobbles ||
                0} | Total Scrobbles: ${totalScrobbles || 0} | Album: ${album}`
            );

          return message.channel.send(embed).then(embedMessage => {
            embedMessage.react('👍');
            embedMessage.react('👎');
          });
        }
      )
    );
};

module.exports.help = {
  name: 'np'
};
