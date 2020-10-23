import { Command } from 'discord.js-commando';
import { MessageEmbed } from 'discord.js';
import { fetch10RecentTracks } from '../../api/lastfm';
import { USER_UNDEFINED_ARGS } from '../../constants';
import { replyEmbedMessage, userInDatabase } from '../../utils';

export default class RecentCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'recent',
      memberName: 'recent',
      group: 'lastfm',
      description: 'Returns the 10 most recently listened to tracks.',
      guildOnly: true,
      throttling: {
        usages: 1,
        duration: 10
      },
      args: [
        {
          key: 'fmUser',
          prompt: 'Enter a registered Last.fm username.',
          type: 'string',
          default: msg => userInDatabase(msg.author.id)
        }
      ]
    });
  }

  async run(msg, { fmUser }) {
    if (!fmUser) {
      return replyEmbedMessage(msg, this.name, USER_UNDEFINED_ARGS);
    }

    const { error, author, description } = await fetch10RecentTracks(fmUser);
    if (error) return replyEmbedMessage(msg, null, error, { fmUser });

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
