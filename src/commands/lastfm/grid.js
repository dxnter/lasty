import Discord, { MessageEmbed } from 'discord.js';
import { Command } from 'discord.js-commando';
import axios from 'axios';
import createCollage from '@settlin/collage';
import {
  PERIOD_PARAMS,
  READABLE_PERIODS,
  USER_UNDEFINED,
  EMPTY_LISTENING_DATA
} from '../../constants';
import { LASTFM_API_KEY } from '../../../config.json';

export default class GridCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'grid',
      memberName: 'grid',
      group: 'lastfm',
      description: 'Returns an album cover grid of a specified size.',
      guildOnly: true,
      throttling: {
        usages: 1,
        duration: 15
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
          default: 'week'
        }
      ]
    });
  }

  async run(msg, { gridSize, period }) {
    msg.channel.startTyping();
    const fmUser = this.client.util.userInDatabase(msg.author.id);
    if (!fmUser) {
      return this.client.util.replyEmbedMessage(msg, null, USER_UNDEFINED);
    }

    const [rows, cols] = gridSize.split('x').map(Number);
    const limit = rows * cols;
    const requestURL = `http://ws.audioscrobbler.com/2.0/?method=user.gettopalbums&user=${fmUser}&period=${PERIOD_PARAMS[period]}&api_key=${LASTFM_API_KEY}&limit=${limit}&format=json`;

    axios
      .get(requestURL)
      .then(
        ({
          data: {
            topalbums: { album: albums }
          }
        }) => {
          const albumCoverLinks = albums.map(album => {
            if (!album.image[2]['#text']) {
              return 'assets/images/album_artwork_not_found.png';
            }
            return album.image[2]['#text'];
          });

          if (albumCoverLinks.length < limit / 2) {
            return this.client.util.replyEmbedMessage(
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

          createCollage(options).then(canvas => {
            const attachment = new Discord.MessageAttachment(
              canvas.toBuffer(),
              `${gridSize}-${period}-${fmUser}.png`
            );

            msg.say(
              new MessageEmbed()
                .setAuthor(
                  `${fmUser} • ${gridSize} • ${READABLE_PERIODS[period]}`,
                  msg.author.avatarURL({ dynamic: true }),
                  `https://www.last.fm/user/${fmUser}`
                )
                .setColor(this.client.color)
            );

            msg.channel.stopTyping();
            return msg.say(attachment);
          });
        }
      )
      .catch(err => {
        console.log(err);
      });
  }
}
