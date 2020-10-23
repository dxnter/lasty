import { Command } from 'discord.js-commando';
import { MessageEmbed } from 'discord.js';
import { fetchArtistInfo } from '../../api/lastfm';
import { replyEmbedMessage, userInDatabase } from '../../utils';

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
    const fmUser = userInDatabase(msg.author.id);
    const {
      error,
      formattedArtistName,
      artistURL,
      totalListeners,
      totalPlays,
      userPlays,
      similarArtistsString,
      biography,
      artist
    } = await fetchArtistInfo(artistName, fmUser);
    if (error) {
      return replyEmbedMessage(msg, null, error, { artist });
    }

    return msg.say(
      new MessageEmbed()
        .setAuthor(formattedArtistName, null, artistURL)
        .addField('Listeners', totalListeners, true)
        .addField('Total Plays', totalPlays, true)
        .addField('Your plays', userPlays, true)
        .addField('Summary', biography)
        .addField('Similar Artists', similarArtistsString)
        .setColor('#E31C23')
    );
  }
}
