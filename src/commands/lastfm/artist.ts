import { Message, MessageEmbed } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { fetchArtistInfo } from '../../api/lastfm';
import Utilities from '../../structures/Utilities';
import { EMBED_COLOR } from '../../../config.json';

interface ArtistArgs {
  artistName: string;
}

export default class ArtistCommand extends Command {
  constructor(client: CommandoClient) {
    super(client, {
      name: 'artist',
      memberName: 'artist',
      group: 'lastfm',
      description:
        'Returns listening data, a biography and similar artists of any given artist.',
      guildOnly: true,
      throttling: {
        usages: 1,
        duration: 5
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

  async run(
    msg: CommandoMessage,
    { artistName }: ArtistArgs
  ): Promise<Message | Message[]> {
    msg.channel.startTyping();
    const fmUser = Utilities.userInDatabase(msg.author.id);
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
      msg.channel.stopTyping();
      return Utilities.replyEmbedMessage(msg, null, error, { artist });
    }

    const totalListeners = `\`${Number(listeners).toLocaleString()}\``;
    const totalPlays = `\`${Number(playcount).toLocaleString()}\``;
    const userPlays = fmUser
      ? `\`${Number(userplaycount).toLocaleString()}\``
      : '`0`';

    const strippedSummary = summary!.replace(
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
    if (similarArtists!.length > 0) {
      similarArtistsString = similarArtists?.reduce((str, { name, url }, i) => {
        if (i === similarArtists.length - 1) {
          return str + `[${name}](${url})`;
        }
        return str + `[${name}](${url}) ∙ `;
      }, '');
    } else {
      similarArtistsString = 'Not Available';
    }

    msg.channel.stopTyping();
    return msg.say(
      new MessageEmbed()
        .setAuthor(formattedArtistName, undefined, artistURL)
        .addField('Listeners', totalListeners, true)
        .addField('Total Plays', totalPlays, true)
        .addField('Your plays', userPlays, true)
        .addField('Summary', biography)
        .addField('Similar Artists', similarArtistsString)
        .setColor(EMBED_COLOR)
    );
  }
}
