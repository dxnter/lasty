import { Message } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import db from '../../db';
import { USER_DELETED, USER_UNDEFINED } from '../../constants';
import Utilities from '../../structures/Utilities';

export default class DeleteCommand extends Command {
  constructor(client: CommandoClient) {
    super(client, {
      name: 'delete',
      aliases: ['reset'],
      memberName: 'delete',
      group: 'lastfm',
      description: 'Deletes your Last.fm username.',
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
      const { userID, fmUser } = existingUser;
      db.get('users')
        .remove({ userID })
        .write();
      return Utilities.replyEmbedMessage(msg, null, USER_DELETED, {
        fmUser
      });
    }

    return Utilities.replyEmbedMessage(msg, null, USER_UNDEFINED);
  }
}
