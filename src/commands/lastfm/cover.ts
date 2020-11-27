import { MessageEmbed, MessageAttachment, Message } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { USER_UNDEFINED_ALBUM_ARGS } from '../../constants';
import { searchAlbum, fetchRecentTrack } from '../../api/lastfm';
import Utilities from '../../structures/Utilities';
import { EMBED_COLOR } from '../../../config.json';
const albumNotFoundImage = new MessageAttachment(
  'assets/images/album_artwork_not_found.png',
  'album_artwork_not_found.png'
);

interface CoverArg {
  albumName: string;
}

export default class CoverCommand extends Command {
  constructor(client: CommandoClient) {
    super(client, {
      name: 'cover',
      memberName: 'cover',
      group: 'lastfm',
      description: 'Returns the album cover of any given album.',
      guildOnly: true,
      throttling: {
        usages: 1,
        duration: 5
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

  async run(
    msg: CommandoMessage,
    { albumName }: CoverArg
  ): Promise<Message | Message[]> {
    msg.channel.startTyping();
    const fmUser = Utilities.userInDatabase(msg.author.id);
    if (!albumName && !fmUser) {
      msg.channel.stopTyping();
      return Utilities.replyEmbedMessage(
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
        msg.channel.stopTyping();
        return Utilities.replyEmbedMessage(msg, this.name, error, {
          album
        });
      }

      // The album URL isn't returned from fetchRecentTrack so it's manually created.
      const albumURL = Utilities.encodeURL(
        `https://last.fm/music/${artist}/${album}`
      );

      msg.channel.stopTyping();
      return msg.say(
        new MessageEmbed()
          .setImage(albumCover!)
          .setDescription(`**${artist}** - **[${album}](${albumURL})**`)
          .setColor(EMBED_COLOR)
      );
    }

    const { error, name, artist, albumURL, albumCoverURL } = await searchAlbum(
      albumName
    );
    if (error) {
      msg.channel.stopTyping();
      return Utilities.replyEmbedMessage(msg, this.name, error, {
        albumName
      });
    }

    if (!albumCoverURL) {
      /**
       * If an album that is searched for doesn't have an album cover image
       * an embed is sent with a custom 'Album Artwork Not Found' image.
       */
      msg.channel.stopTyping();
      return msg.say(
        new MessageEmbed()
          .attachFiles([albumNotFoundImage])
          .setImage('attachment://album_artwork_not_found.png')
          .setDescription(`**${artist}** - **[${name}](${albumURL})**`)
          .setColor(EMBED_COLOR)
      );
    }

    // If the searched albumName has a cover image we return that in the embed instead.
    msg.channel.stopTyping();
    return msg.say(
      new MessageEmbed()
        .setImage(albumCoverURL)
        .setDescription(`**${artist}** - **[${name}](${albumURL})**`)
        .setColor(EMBED_COLOR)
    );
  }
}
