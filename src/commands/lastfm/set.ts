import { Message } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import db from '../../db';
import { USER_EXISTS, USER_SET, USER_UPDATED } from '../../constants';
import Utilities from '../../structures/Utilities';

interface SetArg {
  fmUser: string;
}

export default class SetCommand extends Command {
  constructor(client: CommandoClient) {
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

  async run(
    msg: CommandoMessage,
    { fmUser }: SetArg
  ): Promise<Message | Message[]> {
    const existingUser = Utilities.findExistingUser(msg.author.id);

    if (existingUser) {
      if (existingUser.fmUser.toLowerCase() === fmUser.toLowerCase()) {
        return Utilities.replyEmbedMessage(msg, null, USER_EXISTS, {
          fmUser
        });
      }
      db.get('users')
        .find({ userID: msg.author.id })
        .assign({ fmUser })
        .write();
      return Utilities.replyEmbedMessage(msg, null, USER_UPDATED, {
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
    return Utilities.replyEmbedMessage(msg, null, USER_SET, { fmUser });
  }
}
