import { Command } from 'discord.js-commando';
import {
  USER_ALREADY_UNSUBSCRIBED,
  USER_UNDEFINED,
  USER_UNSUBSCRIBED
} from '../../constants';
import db from '../../db';

export default class UnsubCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'unsub',
      memberName: 'unsub',
      group: 'lastfm',
      description:
        'Unsubscribes you from the Weekly Recap. A personalized listening report sent to you every week.',
      guildOnly: true,
      throttling: {
        usages: 1,
        duration: 10
      }
    });
  }

  async run(msg) {
    const existingUser = this.client.util.findExistingUser(msg.author.id);

    if (existingUser) {
      const { userID, isSubscribedWeekly } = existingUser;
      if (isSubscribedWeekly) {
        db.get('users')
          .find({ userID })
          .assign({ isSubscribedWeekly: false })
          .write();
        return this.client.util.replyEmbedMessage(msg, null, USER_UNSUBSCRIBED);
      }
      return this.client.util.replyEmbedMessage(
        msg,
        null,
        USER_ALREADY_UNSUBSCRIBED
      );
    }
    return this.client.util.replyEmbedMessage(msg, null, USER_UNDEFINED);
  }
}
