import { Command } from 'discord.js-commando';
import { MessageEmbed } from 'discord.js';
import { fetchUsersTopTracks } from '../../api/lastfm';
import { USER_UNDEFINED_ARGS } from '../../constants';

export default class TracksCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'tracks',
      memberName: 'tracks',
      group: 'lastfm',
      description:
        'Returns the most listened to tracks for a given time period.',
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

    const { error, tracks, readablePeriod } = await fetchUsersTopTracks(
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

    const topTracks = tracks.map(track => {
      const {
        artist: { name: artist, url: artistURL },
        name: song,
        playcount,
        url
      } = track;
      return `\`${Number(
        playcount
      ).toLocaleString()} ▶️\` ∙ **[${song}](${this.client.util.encodeURL(
        url
      )})** by [${artist}](${this.client.util.encodeURL(artistURL)})`;
    });

    msg.channel.stopTyping();
    return msg.say(
      new MessageEmbed()
        .setAuthor(
          `Top Tracks ∙ ${readablePeriod} ∙ ${fmUser}`,
          msg.author.avatarURL({ dynamic: true }),
          `https://www.last.fm/user/${fmUser}`
        )
        .setDescription(topTracks)
        .setColor(this.client.color)
    );
  }
}
