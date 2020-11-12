import { Command } from 'discord.js-commando';
import { MessageEmbed } from 'discord.js';
import { USER_UNDEFINED_ARGS } from '../../constants';
import { fetchUsersTopArtists } from '../../api/lastfm';

export default class ArtistsCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'artists',
      memberName: 'artists',
      group: 'lastfm',
      description:
        'Returns the most listened to artists for a given time period.',
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

    const { error, artists, readablePeriod } = await fetchUsersTopArtists(
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

    const topArtists = artists.map(artistRes => {
      const { name: artist, playcount } = artistRes;
      const usersArtistsSrobblesURL = this.client.util.encodeURL(
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
          msg.author.avatarURL({ dynamic: true }),
          `https://www.last.fm/user/${fmUser}`
        )
        .setDescription(topArtists)
        .setColor(this.client.color)
    );
  }
}
