import { Command } from 'discord.js-commando';
import { MessageEmbed } from 'discord.js';
import { fetchArtistTopTracks } from '../../api/lastfm';
import { replyEmbedMessage } from '../../utils';

export default class TopTracksCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'toptracks',
      memberName: 'toptracks',
      group: 'lastfm',
      description: 'Returns the top albums of an artist sorted by popularity.',
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
    const {
      error,
      author,
      description,
      artistURL,
      artist
    } = await fetchArtistTopTracks(artistName);
    if (error) {
      return replyEmbedMessage(msg, null, error, { artist });
    }

    return msg.say(
      new MessageEmbed()
        .setAuthor(author, null, artistURL)
        .setDescription(description)
        .setColor('#E31C23')
    );
  }
}
