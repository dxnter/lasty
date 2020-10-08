import Discord from 'discord.js';
import axios from 'axios';
import db from '../db';
import { Util } from '../utils/util';
import { fetchRecentTrack, fetchUserInfo } from '../api/lastfm';

module.exports.run = async (bot, message, args) => {
  let [fmUser] = args;
  if (!fmUser) {
    const dbUser = db
      .get('users')
      .find({ userID: message.author.id })
      .value();
    if (!dbUser) {
      return Util.replyEmbedMessage(message, args, 'USER_UNDEFINED');
    }
    fmUser = dbUser.lastFM;
  }

  axios
    .all([fetchRecentTrack(fmUser, message), fetchUserInfo(fmUser)])
    .then(
      axios.spread((trackInfo, userInfo) => {
        const {
          track,
          artist,
          album,
          albumCover,
          songURL,
          artistURL,
          userplaycount,
          error
        } = trackInfo;
        if (error) {
          return Util.replyEmbedMessage(message, args, error, null, fmUser);
        }

        const { totalScrobbles, image } = userInfo;
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
    .catch(err =>
      Util.replyEmbedMessage(message, args, 'USER_UNREGISTERED', null, fmUser)
    );
};

module.exports = {
  name: 'np'
};
