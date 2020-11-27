import { Message, TextChannel } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';

interface ClearArg {
  amount: number;
}

export default class ClearCommand extends Command {
  constructor(client: CommandoClient) {
    super(client, {
      name: 'clear',
      memberName: 'clear',
      group: 'util',
      description: 'Clears a number of messages from the chat.',
      guildOnly: true,
      ownerOnly: true,
      args: [
        {
          key: 'amount',
          prompt: 'How many messages would you like to clear?',
          type: 'integer',
          validate: (amount: number) => {
            if (amount > 1 && amount <= 100) return true;
            return 'Enter a number of messages to clear between 2 and 100.';
          }
        }
      ]
    });
  }

  async run(msg: CommandoMessage, { amount }: ClearArg): Promise<any> {
    return (msg.channel as TextChannel).bulkDelete(amount).then(() => {
      msg
        .say(`Cleared ${amount} messages`)
        .then(msg => (msg as Message).delete({ timeout: 1500 }))
        .catch(console.error);
    });
  }
}
