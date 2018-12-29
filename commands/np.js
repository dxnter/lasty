const Discord = require('discord.js');
const axios = require('axios');
const pluralize = require('pluralize');
const { getTotalScrobbles, getRecentTrack } = require('../api/lastfm');
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

  axios.all([getTotalScrobbles(fmUser), getRecentTrack(fmUser)]).then(
    axios.spread((totalScrobbles, trackInfo) => {
      if (trackInfo.error) return message.channel.send(trackInfo.error);
      const {
        track,
        artist,
        album,
        albumCover,
        songURL,
        artistURL,
        userplaycount
      } = trackInfo;

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
          '**Track**',
          `[${track}](${songURL.replace(')', '\\)')})`,
          true
        )
        .addField('**Artist**', `[${artist}](${artistURL})`, true)
        .setFooter(
          `Playcount: ${userplaycount.toLocaleString()} | ${pluralize(
            fmUser
          )} Scrobbles: ${totalScrobbles.toLocaleString() ||
            0} | Album: ${album}`
        )
        .setColor('#E31C23');

      return message.channel.send(embed);
    })
  );
};

module.exports.help = {
  name: 'np'
};
