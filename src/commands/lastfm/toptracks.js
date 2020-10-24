import { Command } from 'discord.js-commando';
import { MessageEmbed } from 'discord.js';
import { fetchArtistTopTracks } from '../../api/lastfm';
import { replyEmbedMessage, sortTotalListeners, pluralize } from '../../utils';

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
    const { error, artist, toptracks, tracks } = await fetchArtistTopTracks(
      artistName
    );
    if (error) {
      return replyEmbedMessage(msg, null, error, { artist });
    }

    const formattedArtist = toptracks['@attr'].artist;
    const artistURL = tracks[0].artist.url;
    const artistTopTracks = tracks.sort(sortTotalListeners()).map(track => {
      const { name, playcount, url: trackURL } = track;
      return `\`${Number(
        playcount
      ).toLocaleString()} ▶️\` • **[${name}](${trackURL.replace(
        ')',
        '\\)'
      )})**`;
    });

    return msg.say(
      new MessageEmbed()
        .setAuthor(
          `${pluralize(formattedArtist)} Top 10 Tracks`,
          null,
          artistURL
        )
        .setDescription(artistTopTracks)
        .setColor('#E31C23')
    );
  }
}
