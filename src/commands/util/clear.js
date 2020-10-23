import { Command } from 'discord.js-commando';

export default class ClearCommand extends Command {
  constructor(client) {
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
          validate: amount => {
            if (amount > 1 && amount <= 100) return true;
            return 'Enter a number of messages to clear between 2 and 100.';
          }
        }
      ]
    });
  }

  run(msg, { amount }) {
    return msg.channel.bulkDelete(amount).then(() => {
      msg
        .say(`Cleared ${amount} messages`)
        .then(msg => msg.delete({ timeout: 1500 }))
        .catch(console.error);
    });
  }
}
