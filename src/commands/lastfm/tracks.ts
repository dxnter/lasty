import { Message, MessageEmbed } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { fetchUsersTopTracks } from '../../api/lastfm';
import { USER_UNDEFINED_ARGS } from '../../constants';
import Utilities from '../../structures/Utilities';
import { EMBED_COLOR } from '../../../config.json';

interface TracksArgs {
  period: string;
  fmUser: string;
}

export default class TracksCommand extends Command {
  constructor(client: CommandoClient) {
    super(client, {
      name: 'tracks',
      memberName: 'tracks',
      group: 'lastfm',
      description:
        'Returns the most listened to tracks for a given time period.',
      guildOnly: true,
      throttling: {
        usages: 1,
        duration: 5
      },
      args: [
        {
          key: 'period',
          prompt: 'Enter a valid period.',
          type: 'string',
          oneOf: ['week', 'month', '90', '180', 'year', 'all'],
          default: 'all'
        },
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
    { period, fmUser }: TracksArgs
  ): Promise<Message | Message[]> {
    msg.channel.startTyping();
    if (!fmUser) {
      msg.channel.stopTyping();
      return Utilities.replyEmbedMessage(msg, this.name, USER_UNDEFINED_ARGS);
    }

    const { error, tracks, readablePeriod } = await fetchUsersTopTracks(
      period,
      fmUser
    );
    if (error) {
      msg.channel.stopTyping();
      return Utilities.replyEmbedMessage(msg, null, error, {
        period,
        fmUser
      });
    }

    const discordAvatar: string = msg.author.avatarURL({ dynamic: true })!;

    const topTracks = tracks?.map(track => {
      const {
        artist: { name: artist, url: artistURL },
        name: song,
        playcount,
        url
      } = track;
      return `\`${Number(
        playcount
      ).toLocaleString()} ▶️\` ∙ **[${song}](${Utilities.encodeURL(
        url
      )})** by [${artist}](${Utilities.encodeURL(artistURL)})`;
    });

    msg.channel.stopTyping();
    return msg.say(
      new MessageEmbed()
        .setAuthor(
          `Top Tracks ∙ ${readablePeriod} ∙ ${fmUser}`,
          discordAvatar,
          `https://www.last.fm/user/${fmUser}`
        )
        .setDescription(topTracks)
        .setColor(EMBED_COLOR)
    );
  }
}
