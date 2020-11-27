import { Message, MessageEmbed } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { USER_UNDEFINED_ARGS } from '../../constants';
import { fetchUsersTopAlbums } from '../../api/lastfm';
import Utilities from '../../structures/Utilities';
import { EMBED_COLOR } from '../../../config.json';

interface AlbumsArgs {
  period: string;
  fmUser: string;
}

export default class AlbumsCommand extends Command {
  constructor(client: CommandoClient) {
    super(client, {
      name: 'albums',
      memberName: 'albums',
      group: 'lastfm',
      description:
        'Returns the most listened to albums for a given time period.',
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
    { period, fmUser }: AlbumsArgs
  ): Promise<Message | Message[]> {
    msg.channel.startTyping();
    if (!fmUser) {
      msg.channel.stopTyping();
      return Utilities.replyEmbedMessage(msg, this.name, USER_UNDEFINED_ARGS);
    }

    const { error, albums, readablePeriod } = await fetchUsersTopAlbums(
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

    const topAlbums = albums?.map(singleAlbum => {
      const {
        name: albumName,
        playcount,
        url: albumURL,
        artist: { name: artistName, url: artistURL }
      } = singleAlbum;
      return `\`${Number(
        playcount
      ).toLocaleString()} ▶️\` ∙ **[${albumName}](${Utilities.encodeURL(
        albumURL
      )})** by [${artistName}](${Utilities.encodeURL(artistURL)})`;
    });

    msg.channel.stopTyping();
    return msg.say(
      new MessageEmbed()
        .setAuthor(
          `Top Albums ∙ ${readablePeriod} ∙ ${fmUser}`,
          discordAvatar,
          `https://www.last.fm/user/${fmUser}`
        )
        .setDescription(topAlbums)
        .setColor(EMBED_COLOR)
    );
  }
}
