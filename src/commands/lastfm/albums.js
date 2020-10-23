import { Command } from 'discord.js-commando';
import { MessageEmbed } from 'discord.js';
import { replyEmbedMessage, userInDatabase } from '../../utils';
import { USER_UNDEFINED_ARGS } from '../../constants';
import { fetchUsersTopAlbums } from '../../api/lastfm';

export default class AlbumsCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'albums',
      memberName: 'albums',
      group: 'lastfm',
      description:
        'Returns the most listened to albums for a given time period.',
      guildOnly: true,
      throttling: {
        usages: 1,
        duration: 10
      },
      args: [
        {
          key: 'period',
          prompt: 'Enter a valid period.',
          type: 'string',
          oneOf: ['week', 'month', '90', '180', 'year', 'all'],
          default: 'all'
        },
        {
          key: 'fmUser',
          prompt: 'Enter a registered Last.fm username.',
          type: 'string',
          default: msg => userInDatabase(msg.author.id)
        }
      ]
    });
  }

  async run(msg, { period, fmUser }) {
    if (!fmUser) {
      return replyEmbedMessage(msg, this.name, USER_UNDEFINED_ARGS);
    }

    const { error, author, description } = await fetchUsersTopAlbums(
      period,
      fmUser
    );
    if (error) {
      return replyEmbedMessage(msg, null, error, { period, fmUser });
    }

    return msg.say(
      new MessageEmbed()
        .setAuthor(
          author,
          msg.author.avatarURL({ dynamic: true }),
          `http://www.last.fm/user/${fmUser}`
        )
        .setDescription(description)
        .setColor('#E31C23')
    );
  }
}
