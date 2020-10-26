import { Command } from 'discord.js-commando';
import db from '../../db';
import {
  USER_ALREADY_SUBSCRIBED,
  USER_SUBSCRIBED,
  USER_UNDEFINED
} from '../../constants';

export default class SubCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'sub',
      memberName: 'sub',
      group: 'lastfm',
      description:
        'Subscribes you to the Weekly Recap. A personalized listening report sent to you every week.',
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
      if (!isSubscribedWeekly) {
        db.get('users')
          .find({ userID })
          .assign({ isSubscribedWeekly: true })
          .write();
        return this.client.util.replyEmbedMessage(msg, null, USER_SUBSCRIBED);
      }
      return this.client.util.replyEmbedMessage(
        msg,
        null,
        USER_ALREADY_SUBSCRIBED
      );
    }
    return this.client.util.replyEmbedMessage(msg, null, USER_UNDEFINED);
  }
}
