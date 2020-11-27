import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { Message, MessageEmbed } from 'discord.js';
import { fetchRecentTrack, fetchUserInfo } from '../../api/lastfm';
import { USER_UNDEFINED_ARGS } from '../../constants';
import Utilities from '../../structures/Utilities';
import { RecentTrackInfo, UserInfo } from 'lastfm';
import { EMBED_COLOR } from '../../../config.json';

interface NowPlayingArg {
  fmUser: string;
}

export default class NowPlayingCommand extends Command {
  constructor(client: CommandoClient) {
    super(client, {
      name: 'np',
      memberName: 'np',
      group: 'lastfm',
      description: 'Returns the most recently listened track.',
      guildOnly: true,
      throttling: {
        usages: 1,
        duration: 5
      },
      args: [
        {
          key: 'fmUser',
          prompt: 'Enter a registered Last.fm username.',
          type: 'string',
          default: (msg: { author: { id: string } }) =>
            Utilities.userInDatabase(msg.author.id)
        }
      ]
    });
  }

  async run(
    msg: CommandoMessage,
    { fmUser }: NowPlayingArg
  ): Promise<Message | Message[]> {
    msg.channel.startTyping();
    if (!fmUser) {
      msg.channel.stopTyping();
      return Utilities.replyEmbedMessage(msg, this.name, USER_UNDEFINED_ARGS);
    }

    const [trackInfo, userInfo] = await Promise.all<
      Partial<RecentTrackInfo> & Partial<UserInfo>
    >([fetchRecentTrack(fmUser), fetchUserInfo(fmUser)]);

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
      msg.channel.stopTyping();
      return Utilities.replyEmbedMessage(msg, null, error, { fmUser });
    }

    const { totalScrobbles, lastFMAvatar } = userInfo;
    const isDisplayedInline = track!.length < 25 ? true : false;

    const npEmbed = new MessageEmbed()
      .setAuthor(
        `Last.fm - ${fmUser}`,
        lastFMAvatar,
        `http://www.last.fm/user/${fmUser}`
      )
      .setThumbnail(albumCover!)
      .addField(
        '**Track**',
        `[${track}](${Utilities.encodeURL(songURL!)})`,
        isDisplayedInline
      )
      .addField('**Artist**', `[${artist}](${artistURL})`, isDisplayedInline)
      .setFooter(
        `Playcount: ${userplaycount} ∙ ${fmUser} Scrobbles: ${totalScrobbles ||
        0} ∙ Album: ${album} ${trackLength ? `∙ Length: ${trackLength}` : ''}`
      )
      .setColor(EMBED_COLOR);

    msg.channel.stopTyping();
    return msg.say(npEmbed).then(
      async (msg: Message): Promise<any> => {
        await msg.react('👍');
        await msg.react('👎');
      }
    );
  }
}
