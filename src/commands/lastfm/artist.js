import { Command } from 'discord.js-commando';
import { MessageEmbed } from 'discord.js';
import { fetchArtistInfo } from '../../api/lastfm';

export default class ArtistCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'artist',
      memberName: 'artist',
      group: 'lastfm',
      description:
        'Returns listening data, a biography and similar artists of any given artist.',
      guildOnly: true,
      throttling: {
        usages: 1,
        duration: 10
      },
      args: [
        {
          key: 'artistName',
          prompt: 'Enter an artist name.',
          type: 'string'
        }
      ]
    });
  }

  async run(msg, { artistName }) {
    const fmUser = this.client.util.userInDatabase(msg.author.id);
    const {
      error,
      artist,
      formattedArtistName,
      artistURL,
      listeners,
      playcount,
      userplaycount,
      similarArtists,
      summary
    } = await fetchArtistInfo(artistName, fmUser);
    if (error) {
      return this.client.util.replyEmbedMessage(msg, null, error, { artist });
    }

    const totalListeners = `\`${Number(listeners).toLocaleString()}\``;
    const totalPlays = `\`${Number(playcount).toLocaleString()}\``;
    const userPlays = fmUser
      ? `\`${Number(userplaycount).toLocaleString()}\``
      : '`0`';

    const strippedSummary = summary.replace(
      `<a href="${artistURL}">Read more on Last.fm</a>`,
      ''
    );

    /**
     * Some artists don't have a full biography available. After removing the <a> tag that's
     * on every response a check is done to make sure it still contains content.
     */
    const biography =
      strippedSummary.length > 1 ? strippedSummary : 'Not Available';

    let similarArtistsString;
    if (similarArtists.length > 0) {
      similarArtistsString = similarArtists.reduce((str, { name, url }, i) => {
        if (i === similarArtists.length - 1) {
          return str + `[${name}](${url})`;
        }
        return str + `[${name}](${url}) • `;
      }, '');
    } else {
      similarArtistsString = 'Not Available';
    }

    return msg.say(
      new MessageEmbed()
        .setAuthor(formattedArtistName, null, artistURL)
        .addField('Listeners', totalListeners, true)
        .addField('Total Plays', totalPlays, true)
        .addField('Your plays', userPlays, true)
        .addField('Summary', biography)
        .addField('Similar Artists', similarArtistsString)
        .setColor(this.client.color)
    );
  }
}
