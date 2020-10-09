import { replyEmbedMessage } from '../utils';
import { PERMISSION_INVALID } from '../constants';

module.exports = {
  name: 'clear',
  run: (bot, message, args) => {
    if (!message.member.hasPermission('ADMINISTRATOR')) {
      console.log('admin');
      return replyEmbedMessage(message, args, PERMISSION_INVALID);
    }
    const amount = Number(args[0]);

    if (!amount) return message.reply('give amount');
    if (isNaN(amount)) return message.reply('not a num');

    if (amount > 100) return message.reply('no more than 100');
    if (amount < 1) return message.reply('delete at least 1');

    message.channel.bulkDelete(amount).then(() => {
      message.channel
        .send(`Deleted ${amount} messages`)
        .then(msg => msg.delete({ timeout: 1500 }))
        .catch(console.error);
    });
  }
};
