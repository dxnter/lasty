import { Message } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import {
  USER_ALREADY_UNSUBSCRIBED,
  USER_UNDEFINED,
  USER_UNSUBSCRIBED
} from '../../constants';
import db from '../../db';
import Utilities from '../../structures/Utilities';

export default class UnsubCommand extends Command {
  constructor(client: CommandoClient) {
    super(client, {
      name: 'unsub',
      memberName: 'unsub',
      group: 'lastfm',
      description:
        'Unsubscribes you from the Weekly Recap. A personalized listening report sent to you every week.',
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
      if (isSubscribedWeekly) {
        db.get('users')
          .find({ userID })
          .assign({ isSubscribedWeekly: false })
          .write();
        return Utilities.replyEmbedMessage(msg, null, USER_UNSUBSCRIBED);
      }
      return Utilities.replyEmbedMessage(msg, null, USER_ALREADY_UNSUBSCRIBED);
    }
    return Utilities.replyEmbedMessage(msg, null, USER_UNDEFINED);
  }
}
