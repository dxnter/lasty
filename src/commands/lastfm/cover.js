import { Command } from 'discord.js-commando';
import { MessageEmbed, MessageAttachment } from 'discord.js';
import { USER_UNDEFINED_ALBUM_ARGS } from '../../constants';
import { fetchAlbumCover, fetchRecentTrack } from '../../api/lastfm';
const albumNotFoundImage = new MessageAttachment(
  'assets/images/album_artwork_not_found.png',
  'album_artwork_not_found.png'
);

export default class CoverCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'cover',
      memberName: 'cover',
      group: 'lastfm',
      description: 'Returns the album cover of any given album.',
      guildOnly: true,
      throttling: {
        usages: 1,
        duration: 10
      },
      args: [
        {
          key: 'albumName',
          prompt: 'Enter an album name.',
          type: 'string',
          default: ''
        }
      ]
    });
  }

  async run(msg, { albumName }) {
    const fmUser = this.client.util.userInDatabase(msg.author.id);
    if (!albumName && !fmUser) {
      return this.client.util.replyEmbedMessage(
        msg,
        this.name,
        USER_UNDEFINED_ALBUM_ARGS
      );
    }
    if (!albumName && fmUser) {
      // If no albumName is given as an argument, track info is fetched on their most recent track.
      const { error, album, artist, albumCover } = await fetchRecentTrack(
        fmUser
      );
      if (error) {
        return this.client.util.replyEmbedMessage(msg, this.name, error, {
          album
        });
      }

      // The album URL isn't returned from fetchRecentTrack so it's manually created.
      const albumURL = `https://last.fm/music/${artist
        .split(' ')
        .join('+')}/${album.split(' ').join('+')}`;

      return msg.say(
        new MessageEmbed()
          .setImage(albumCover)
          .setDescription(`**${artist}** - **[${album}](${albumURL})**`)
          .setColor(this.client.color)
      );
    }

    const {
      error,
      name,
      artist,
      albumURL,
      albumCoverURL
    } = await fetchAlbumCover(albumName);
    if (error) {
      return this.client.util.replyEmbedMessage(msg, this.name, error, {
        albumName
      });
    }

    if (!albumCoverURL) {
      /**
       * If an album that is searched for doesn't have an album cover image
       * an embed is sent with a custom 'Album Artwork Not Found' image.
       */
      return msg.say(
        new MessageEmbed()
          .attachFiles(albumNotFoundImage)
          .setImage('attachment://album_artwork_not_found.png')
          .setDescription(`**${artist}** - **[${name}](${albumURL})**`)
          .setColor(this.client.color)
      );
    }

    // If the searched albumName has a cover image we return that in the embed instead.
    return msg.say(
      new MessageEmbed()
        .setImage(albumCoverURL)
        .setDescription(`**${artist}** - **[${name}](${albumURL})**`)
        .setColor(this.client.color)
    );
  }
}
