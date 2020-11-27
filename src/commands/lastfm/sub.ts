import { Message } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import db from '../../db';
import {
  USER_ALREADY_SUBSCRIBED,
  USER_SUBSCRIBED,
  USER_UNDEFINED
} from '../../constants';
import Utilities from '../../structures/Utilities';

export default class SubCommand extends Command {
  constructor(client: CommandoClient) {
    super(client, {
      name: 'sub',
      memberName: 'sub',
      group: 'lastfm',
      description:
        'Subscribes you to the Weekly Recap. A personalized listening report sent to you every week.',
      guildOnly: true,
      throttling: {
        usages: 1,
        duration: 5
      }
    });
  }

  async run(msg: CommandoMessage): Promise<Message | Message[]> {
    const existingUser = Utilities.findExistingUser(msg.author.id);

    if (existingUser) {
      const { userID, isSubscribedWeekly } = existingUser;
      if (!isSubscribedWeekly) {
        db.get('users')
          .find({ userID })
          .assign({ isSubscribedWeekly: true })
          .write();
        return Utilities.replyEmbedMessage(msg, null, USER_SUBSCRIBED);
      }
      return Utilities.replyEmbedMessage(msg, null, USER_ALREADY_SUBSCRIBED);
    }
    return Utilities.replyEmbedMessage(msg, null, USER_UNDEFINED);
  }
}
