import { Command } from 'discord.js-commando';
import db from '../../db';
import { USER_DELETED, USER_UNDEFINED } from '../../constants';

export default class DeleteCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'delete',
      aliases: ['reset'],
      memberName: 'delete',
      group: 'lastfm',
      description: 'Deletes your Last.fm username.',
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
      const { userID, fmUser } = existingUser;
      db.get('users')
        .remove({ userID })
        .write();
      return this.client.util.replyEmbedMessage(msg, null, USER_DELETED, {
        fmUser
      });
    }

    return this.client.util.replyEmbedMessage(msg, null, USER_UNDEFINED);
  }
}
