import { Message, MessageEmbed } from 'discord.js';
import { Command, CommandoMessage, CommandoClient } from 'discord.js-commando';
import { fetchArtistTopAlbums } from '../../api/lastfm';
import Utilities from '../../structures/Utilities';
import { Album } from 'lastfm';
import { EMBED_COLOR } from '../../../config.json';

interface TopAlbumsArg {
  artistName: string;
}

export default class TopAlbumsCommand extends Command {
  constructor(client: CommandoClient) {
    super(client, {
      name: 'topalbums',
      memberName: 'topalbums',
      group: 'lastfm',
      description: 'Returns the top albums of an artist sorted by popularity.',
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
    { artistName }: TopAlbumsArg
  ): Promise<Message | Message[]> {
    msg.channel.startTyping();
    const { error, artist, albums } = await fetchArtistTopAlbums(artistName);
    if (error) {
      msg.channel.stopTyping();
      return Utilities.replyEmbedMessage(msg, null, error, { artist });
    }
    const formattedArtist = albums![0].artist.name;
    const artistURL = albums![0].artist.url;
    const artistTopAlbums = albums!
      .filter((album: Album) => album.name !== '(null)')
      .sort(Utilities.sortTotalListeners())
      .map((album: Album) => {
        const { name, playcount, url: albumURL } = album;
        return `\`${Number(
          playcount
        ).toLocaleString()} ▶️\` ∙ **[${name}](${Utilities.encodeURL(
          albumURL
        )})**`;
      })
      .filter((_, i: number) => i !== 10);

    msg.channel.stopTyping();
    return msg.say(
      new MessageEmbed()
        .setAuthor(`${formattedArtist} ∙ Top 10 Albums`, undefined, artistURL)
        .setDescription(artistTopAlbums)
        .setColor(EMBED_COLOR)
    );
  }
}
