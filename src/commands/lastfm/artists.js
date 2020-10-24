import { Command } from 'discord.js-commando';
import { MessageEmbed } from 'discord.js';
import { replyEmbedMessage, userInDatabase } from '../../utils';
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
          default: msg => userInDatabase(msg.author.id)
        }
      ]
    });
  }

  async run(msg, { period, fmUser }) {
    if (!fmUser) {
      return replyEmbedMessage(msg, this.name, USER_UNDEFINED_ARGS);
    }

    const { error, artists, readablePeriod } = await fetchUsersTopArtists(
      period,
      fmUser
    );
    if (error) {
      return replyEmbedMessage(msg, null, error, { period, fmUser });
    }

    const topArtists = artists.map(artistRes => {
      const { name: artist, playcount } = artistRes;
      const usersArtistsSrobblesURL = `https://www.last.fm/user/${fmUser}/library/music/${artist
        .split(' ')
        .join('+')}`;
      return `\`${Number(
        playcount
      ).toLocaleString()} ▶️\` • **[${artist}](${usersArtistsSrobblesURL})**`;
    });

    return msg.say(
      new MessageEmbed()
        .setAuthor(
          `Top Artists - ${readablePeriod} - ${fmUser}`,
          msg.author.avatarURL({ dynamic: true }),
          `http://www.last.fm/user/${fmUser}`
        )
        .setDescription(topArtists)
        .setColor('#E31C23')
    );
  }
}
