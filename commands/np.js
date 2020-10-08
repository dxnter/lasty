import Discord from 'discord.js';
import axios from 'axios';
import db from '../db';
import {
  fetchTotalScrobbles,
  fetchRecentTrack,
  fetchUserInfo
} from '../api/lastfm';

module.exports.run = async (bot, message, args) => {
  let [fmUser] = args;
  if (!fmUser) {
    const dbUser = db
      .get('users')
      .find({ userID: message.author.id })
      .value();
    if (!dbUser) {
      return message.channel.send(
        `<@${message.author.id}>, Please set your Last.FM username with \`,lf set <username>\`\nNo account? Sign up: https://www.last.fm/join`
      );
    }
    fmUser = dbUser.lastFM;
  }

  axios
    .all([
      fetchTotalScrobbles(fmUser),
      fetchRecentTrack(fmUser, message),
      fetchUserInfo(fmUser)
    ])
    .then(
      axios.spread((totalScrobbles, trackInfo, userInfo) => {
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

        const { image } = userInfo;
        const lastFMAvatar = image[2]['#text'];

        const embed = new Discord.RichEmbed()
          .setAuthor(
            `Now playing - ${fmUser}`,
            lastFMAvatar,
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
            `Playcount: ${userplaycount.toLocaleString()} | ${fmUser} Scrobbles: ${Number(
              totalScrobbles
            ).toLocaleString() || 0} | Album: ${album}`
          )
          .setColor('#E31C23');

        return message.channel.send(embed).then(async msg => {
          await msg.react('👍');
          await msg.react('👎');
        });
      })
    )
    .catch(err => console.log(err));
};

module.exports = {
  name: 'np'
};
