import { Command } from 'discord.js-commando';
import db from '../../db';
import { USER_EXISTS, USER_SET, USER_UPDATED } from '../../constants';

export default class SetCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'set',
      memberName: 'set',
      group: 'lastfm',
      description: 'Sets your Last.fm username.',
      guildOnly: true,
      throttling: {
        usages: 1,
        duration: 5
      },
      args: [
        {
          key: 'fmUser',
          prompt: 'Enter a registered Last.fm username to set.',
          type: 'string'
        }
      ]
    });
  }

  async run(msg, { fmUser }) {
    const existingUser = this.client.util.findExistingUser(msg.author.id);

    if (existingUser) {
      if (existingUser.fmUser.toLowerCase() === fmUser.toLowerCase()) {
        return this.client.util.replyEmbedMessage(msg, null, USER_EXISTS, {
          fmUser
        });
      }
      db.get('users')
        .find({ userID: msg.author.id })
        .assign({ fmUser })
        .write();
      return this.client.util.replyEmbedMessage(msg, null, USER_UPDATED, {
        fmUser
      });
    }

    db.get('users')
      .push({
        userID: msg.author.id,
        fmUser,
        isSubscribedWeekly: true
      })
      .write();
    return this.client.util.replyEmbedMessage(msg, null, USER_SET, { fmUser });
  }
}
