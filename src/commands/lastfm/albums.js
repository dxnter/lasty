import { Command } from 'discord.js-commando';
import { MessageEmbed } from 'discord.js';
import { USER_UNDEFINED_ARGS } from '../../constants';
import { fetchUsersTopAlbums } from '../../api/lastfm';

export default class AlbumsCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'albums',
      memberName: 'albums',
      group: 'lastfm',
      description:
        'Returns the most listened to albums for a given time period.',
      guildOnly: true,
      throttling: {
        usages: 1,
        duration: 10
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
          default: msg => this.client.util.userInDatabase(msg.author.id)
        }
      ]
    });
  }

  async run(msg, { period, fmUser }) {
    msg.channel.startTyping();
    if (!fmUser) {
      msg.channel.stopTyping();
      return this.client.util.replyEmbedMessage(
        msg,
        this.name,
        USER_UNDEFINED_ARGS
      );
    }

    const { error, albums, readablePeriod } = await fetchUsersTopAlbums(
      period,
      fmUser
    );
    if (error) {
      msg.channel.stopTyping();
      return this.client.util.replyEmbedMessage(msg, null, error, {
        period,
        fmUser
      });
    }

    const topAlbums = albums.map(singleAlbum => {
      const {
        name: albumName,
        playcount,
        url: albumURL,
        artist: { name: artistName, url: artistURL }
      } = singleAlbum;
      return `\`${Number(
        playcount
      ).toLocaleString()} ▶️\` ∙ **[${albumName}](${this.client.util.encodeURL(
        albumURL
      )})** by [${artistName}](${this.client.util.encodeURL(artistURL)})`;
    });

    msg.channel.stopTyping();
    return msg.say(
      new MessageEmbed()
        .setAuthor(
          `Top Albums ∙ ${readablePeriod} ∙ ${fmUser}`,
          msg.author.avatarURL({ dynamic: true }),
          `https://www.last.fm/user/${fmUser}`
        )
        .setDescription(topAlbums)
        .setColor(this.client.color)
    );
  }
}
