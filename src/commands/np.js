import Discord from 'discord.js';
import axios from 'axios';
import { fetchRecentTrack, fetchUserInfo } from '../api/lastfm';
import db from '../db';
import { USER_UNDEFINED, USER_UNREGISTERED } from '../constants';
import { replyEmbedMessage } from '../utils';

module.exports = {
  name: 'np',
  run: async (bot, message, args) => {
    let [fmUser] = args;
    if (!fmUser) {
      const dbUser = db
        .get('users')
        .find({ userID: message.author.id })
        .value();
      if (!dbUser) {
        return replyEmbedMessage(message, args, USER_UNDEFINED);
      }
      fmUser = dbUser.lastFM;
    }

    axios
      .all([fetchRecentTrack(fmUser, message), fetchUserInfo(fmUser)])
      .then(
        axios.spread((trackInfo, userInfo) => {
          const {
            track,
            trackLength,
            artist,
            album,
            albumCover,
            songURL,
            artistURL,
            userplaycount,
            error
          } = trackInfo;
          if (error) {
            return replyEmbedMessage(message, args, error, { fmUser });
          }

          const { totalScrobbles, image } = userInfo;
          const lastFMAvatar = image[2]['#text'];

          const embed = new Discord.MessageEmbed()
            .setAuthor(
              `Last.fm - ${fmUser}`,
              lastFMAvatar,
              `http://www.last.fm/user/${fmUser}`
            )
            .setThumbnail(albumCover)
            .addField(
              '**Track**',
              `[${track}](${songURL.replace(')', '\\)')}) ${
                trackLength ? `- *${trackLength}*` : ''
              }`
            )
            .addField('**Artist**', `[${artist}](${artistURL})`)
            .setFooter(
              `Playcount: ${userplaycount} | ${fmUser} Scrobbles: ${totalScrobbles ||
                0} | Album: ${album}`
            )
            .setColor('#E31C23');

          return message.channel.send(embed).then(async msg => {
            await msg.react('👍');
            await msg.react('👎');
          });
        })
      )
      .catch(err =>
        replyEmbedMessage(message, args, USER_UNREGISTERED, { fmUser })
      );
  }
};
