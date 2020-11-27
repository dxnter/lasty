import { Message, MessageEmbed } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { USER_UNDEFINED_ARGS } from '../../constants';
import { fetchUsersTopArtists } from '../../api/lastfm';
import Utilities from '../../structures/Utilities';
import { EMBED_COLOR } from '../../../config.json';

interface ArtistsArgs {
  period: string;
  fmUser: string;
}

export default class ArtistsCommand extends Command {
  constructor(client: CommandoClient) {
    super(client, {
      name: 'artists',
      memberName: 'artists',
      group: 'lastfm',
      description:
        'Returns the most listened to artists for a given time period.',
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
    { period, fmUser }: ArtistsArgs
  ): Promise<Message | Message[]> {
    msg.channel.startTyping();
    if (!fmUser) {
      msg.channel.stopTyping();
      return Utilities.replyEmbedMessage(msg, this.name, USER_UNDEFINED_ARGS);
    }

    const { error, artists, readablePeriod } = await fetchUsersTopArtists(
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

    const topArtists = artists?.map(artistRes => {
      const { name: artist, playcount } = artistRes;
      const usersArtistsSrobblesURL = Utilities.encodeURL(
        `https://www.last.fm/user/${fmUser}/library/music/${artist}`
      );
      return `\`${Number(
        playcount
      ).toLocaleString()} ▶️\` ∙ **[${artist}](${usersArtistsSrobblesURL})**`;
    });

    msg.channel.stopTyping();
    return msg.say(
      new MessageEmbed()
        .setAuthor(
          `Top Artists ∙ ${readablePeriod} ∙ ${fmUser}`,
          discordAvatar,
          `https://www.last.fm/user/${fmUser}`
        )
        .setDescription(topArtists)
        .setColor(EMBED_COLOR)
    );
  }
}
