import Discord, { Message, MessageEmbed } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import axios from 'axios';
import createCollage from '@settlin/collage';
import { Canvas } from 'canvas';
import {
  PERIOD_PARAMS,
  READABLE_PERIODS,
  USER_UNDEFINED,
  EMPTY_LISTENING_DATA
} from '../../constants';
import Utilities from '../../structures/Utilities';
import { Album } from 'lastfm';
import { LASTFM_API_KEY, EMBED_COLOR } from '../../../config.json';

interface GridArgs {
  gridSize: string;
  period: string;
}

export default class GridCommand extends Command {
  constructor(client: CommandoClient) {
    super(client, {
      name: 'grid',
      memberName: 'grid',
      group: 'lastfm',
      description: 'Returns an album cover grid of a specified size.',
      guildOnly: true,
      throttling: {
        usages: 1,
        duration: 10
      },
      args: [
        {
          key: 'gridSize',
          prompt: 'Enter a grid size.',
          type: 'string',
          oneOf: ['3x3', '4x4', '5x5'],
          default: '3x3'
        },
        {
          key: 'period',
          prompt: 'Enter a valid period.',
          type: 'string',
          oneOf: ['week', 'month', '90', '180', 'year', 'all'],
          default: 'all'
        }
      ]
    });
  }

  async run(
    msg: CommandoMessage,
    { gridSize, period }: GridArgs
  ): Promise<Message | Message[]> {
    msg.channel.startTyping();
    const fmUser = Utilities.userInDatabase(msg.author.id);
    if (!fmUser) {
      return Utilities.replyEmbedMessage(msg, null, USER_UNDEFINED);
    }

    const [rows, cols] = gridSize.split('x').map(Number);
    const limit = rows * cols;
    const requestURL = `http://ws.audioscrobbler.com/2.0/?method=user.gettopalbums&user=${fmUser}&period=${PERIOD_PARAMS[period]}&api_key=${LASTFM_API_KEY}&limit=${limit}&format=json`;

    const albumGrid = await axios
      .get(requestURL)
      .then(
        ({
          data: {
            topalbums: { album: albums }
          }
        }) => {
          const albumCoverLinks = albums.map((album: Album) => {
            if (!album.image[2]['#text']) {
              return 'assets/images/album_artwork_not_found.png';
            }
            return album.image[2]['#text'];
          });

          if (albumCoverLinks.length < limit / 2) {
            msg.channel.stopTyping();
            return Utilities.replyEmbedMessage(
              msg,
              null,
              EMPTY_LISTENING_DATA,
              { fmUser }
            );
          }

          const options = {
            sources: albumCoverLinks,
            width: rows,
            height: cols,
            imageWidth: 174,
            imageHeight: 174,
            backgroundColor: '#36393E'
          };

          return createCollage(options).then((canvas: Canvas) => {
            return new Discord.MessageAttachment(
              canvas.toBuffer(),
              `${gridSize}-${period}-${fmUser}.png`
            );
          });
        }
      )
      .catch(err => {
        msg.channel.stopTyping();
        console.error(err);
      });

    const discordAvatar: string = msg.author.avatarURL({
      dynamic: true
    })!;

    msg.say(
      new MessageEmbed()
        .setAuthor(
          `${fmUser} • ${gridSize} • ${READABLE_PERIODS[period]}`,
          discordAvatar,
          `https://www.last.fm/user/${fmUser}`
        )
        .setColor(EMBED_COLOR)
    );

    msg.channel.stopTyping();
    return msg.say(albumGrid);
  }
}
