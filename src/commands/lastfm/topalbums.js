import { Command } from 'discord.js-commando';
import { MessageEmbed } from 'discord.js';
import { fetchArtistTopAlbums } from '../../api/lastfm';
import { replyEmbedMessage, sortTotalListeners, pluralize } from '../../utils';

export default class TopAlbumsCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'topalbums',
      memberName: 'topalbums',
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
    const { error, artist, topalbums } = await fetchArtistTopAlbums(artistName);
    if (error) {
      return replyEmbedMessage(msg, null, error, { artist });
    }

    const formattedArtist = topalbums['@attr'].artist;
    const artistURL = topalbums.album[0].artist.url;
    const artistTopAlbums = topalbums.album
      .sort(sortTotalListeners())
      .map(album => {
        const { name, playcount, url: albumURL } = album;
        return `\`${Number(
          playcount
        ).toLocaleString()} ▶️\` • **[${name}](${albumURL.replace(
          ')',
          '\\)'
        )})**`;
      });

    return msg.say(
      new MessageEmbed()
        .setAuthor(
          `${pluralize(formattedArtist)} Top 10 Albums`,
          null,
          artistURL
        )
        .setDescription(artistTopAlbums)
        .setColor('#E31C23')
    );
  }
}
