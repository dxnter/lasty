import { Message, MessageEmbed } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { fetchUserInfo } from '../../api/lastfm';
import { USER_UNDEFINED_ARGS } from '../../constants';
import Utilities from '../../structures/Utilities';
import { EMBED_COLOR } from '../../../config.json';

interface InfoArg {
  fmUser: string;
}

export default class InfoCommand extends Command {
  constructor(client: CommandoClient) {
    super(client, {
      name: 'info',
      memberName: 'info',
      group: 'lastfm',
      description: 'Returns information about a Last.fm profile.',
      guildOnly: true,
      throttling: {
        usages: 1,
        duration: 5
      },
      args: [
        {
          key: 'fmUser',
          prompt: 'Enter a registered Last.fm username.',
          type: 'string',
          default: (msg: { author: { id: string } }) =>
            Utilities.userInDatabase(msg.author.id)
        }
      ]
    });
  }

  async run(
    msg: CommandoMessage,
    { fmUser }: InfoArg
  ): Promise<Message | Message[]> {
    msg.channel.startTyping();
    if (!fmUser) {
      msg.channel.stopTyping();
      return Utilities.replyEmbedMessage(msg, this.name, USER_UNDEFINED_ARGS);
    }

    const {
      error,
      totalScrobbles,
      name,
      profileURL,
      country,
      lastFMAvatar,
      unixRegistration
    } = await fetchUserInfo(fmUser);
    if (error) {
      msg.channel.stopTyping();
      return Utilities.replyEmbedMessage(msg, null, error, { fmUser });
    }

    msg.channel.stopTyping();
    return msg.say(
      new MessageEmbed()
        .setAuthor(name, lastFMAvatar, profileURL)
        .setThumbnail(lastFMAvatar!)
        .addField('Total Scrobbes', totalScrobbles)
        .addField('Country', country)
        .addField(
          'Registration Date',
          new Date(Number(unixRegistration) * 1000).toLocaleString()
        )
        .setColor(EMBED_COLOR)
    );
  }
}
