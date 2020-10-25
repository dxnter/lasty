import { Command } from 'discord.js-commando';
import { MessageEmbed, MessageAttachment } from 'discord.js';
import { replyEmbedMessage, userInDatabase } from '../../utils';
import { USER_UNDEFINED_ALBUM_ARGS } from '../../constants';
import { fetchAlbumCover, fetchRecentTrack } from '../../api/lastfm';

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
    const fmUser = userInDatabase(msg.author.id);
    if (!albumName && !fmUser) {
      return replyEmbedMessage(msg, this.name, USER_UNDEFINED_ALBUM_ARGS);
    }
    if (!albumName && fmUser) {
      const { album } = await fetchRecentTrack(fmUser);
      albumName = album;
    }

    const {
      error,
      name,
      artist,
      albumURL,
      albumCoverURL
    } = await fetchAlbumCover(albumName);
    if (error) {
      return replyEmbedMessage(msg, this.name, error, { albumName });
    }

    const AlbumCover = new MessageAttachment(albumCoverURL);

    await msg.say(AlbumCover);
    return msg.say(
      new MessageEmbed()
        .setDescription(`**${artist}** - **[${name}](${albumURL})**`)
        .setColor('#E31C23')
    );
  }
}
