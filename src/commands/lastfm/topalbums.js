import { Command } from 'discord.js-commando';
import { MessageEmbed } from 'discord.js';
import { fetchArtistTopAlbums } from '../../api/lastfm';

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
      return this.client.util.replyEmbedMessage(msg, null, error, { artist });
    }
    const formattedArtist = topalbums['@attr'].artist;
    const artistURL = topalbums.album[0].artist.url;
    const artistTopAlbums = topalbums.album
      .filter(track => track.name !== '(null)')
      .sort(this.client.util.sortTotalListeners())
      .map(album => {
        const { name, playcount, url: albumURL } = album;
        return `\`${Number(
          playcount
        ).toLocaleString()} ▶️\` • **[${name}](${albumURL.replace(
          ')',
          '\\)'
        )})**`;
      })
      .filter((track, i) => i !== 10);

    return msg.say(
      new MessageEmbed()
        .setAuthor(
          `${this.client.util.pluralize(formattedArtist)} Top 10 Albums`,
          null,
          artistURL
        )
        .setDescription(artistTopAlbums)
        .setColor(this.client.color)
    );
  }
}
