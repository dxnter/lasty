import { Message, MessageEmbed } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { fetchArtistTopTracks } from '../../api/lastfm';
import Utilities from '../../structures/Utilities';
import { Track } from 'lastfm';
import { EMBED_COLOR } from '../../../config.json';

interface TopTracksArg {
  artistName: string;
}

export default class TopTracksCommand extends Command {
  constructor(client: CommandoClient) {
    super(client, {
      name: 'toptracks',
      memberName: 'toptracks',
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
    { artistName }: TopTracksArg
  ): Promise<Message | Message[]> {
    msg.channel.startTyping();
    const { error, artist, tracks } = await fetchArtistTopTracks(artistName);
    if (error) {
      msg.channel.stopTyping();
      return Utilities.replyEmbedMessage(msg, null, error, { artist });
    }

    const formattedArtist = tracks![0].artist.name;
    const artistURL = tracks![0].artist.url;
    const artistTopTracks = tracks!
      .filter((track: Track) => track.name !== '(null)')
      .sort(Utilities.sortTotalListeners())
      .map((track: Track) => {
        const { name, playcount, url: trackURL } = track;
        return `\`${Number(
          playcount
        ).toLocaleString()} ▶️\` ∙ **[${name}](${Utilities.encodeURL(
          trackURL
        )})**`;
      })
      .filter((_, i: number) => i !== 10);

    msg.channel.stopTyping();
    return msg.say(
      new MessageEmbed()
        .setAuthor(`${formattedArtist} ∙ Top 10 Tracks`, undefined, artistURL)
        .setDescription(artistTopTracks)
        .setColor(EMBED_COLOR)
    );
  }
}
