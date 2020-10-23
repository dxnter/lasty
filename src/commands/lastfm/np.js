import { Command } from 'discord.js-commando';
import { MessageEmbed } from 'discord.js';
import axios from 'axios';
import { fetchRecentTrack, fetchUserInfo } from '../../api/lastfm';
import { USER_UNDEFINED_ARGS } from '../../constants';
import { userInDatabase, replyEmbedMessage } from '../../utils';

export default class NowPlayingCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'np',
      memberName: 'np',
      group: 'lastfm',
      description: 'Returns the most recently listened track.',
      guildOnly: true,
      throttling: {
        usages: 1,
        duration: 10
      },
      args: [
        {
          key: 'fmUser',
          prompt: 'Enter a registered Last.fm username.',
          type: 'string',
          default: msg => userInDatabase(msg.author.id)
        }
      ]
    });
  }

  async run(msg, { fmUser }) {
    if (!fmUser) {
      return replyEmbedMessage(msg, this.name, USER_UNDEFINED_ARGS);
    }

    axios.all([fetchRecentTrack(fmUser), fetchUserInfo(fmUser)]).then(
      axios.spread((trackInfo, userInfo) => {
        const {
          error,
          track,
          trackLength,
          artist,
          album,
          albumCover,
          songURL,
          artistURL,
          userplaycount
        } = trackInfo;
        if (error) {
          return replyEmbedMessage(msg, null, error, { fmUser });
        }

        const { totalScrobbles, image } = userInfo;
        const lastFMAvatar = image[2]['#text'];

        const embed = new MessageEmbed()
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

        return msg.say(embed).then(async msg => {
          await msg.react('👍');
          await msg.react('👎');
        });
      })
    );
  }
}
