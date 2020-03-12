module.exports.run = async (bot, message, args) => {
  if (!message.member.hasPermission('MANAGE_MESSAGES')) {
    return message.reply('oof.');
  }
  if (!args[0])
    return message.channel.send(
      'Please supply a clear amount\n`,clear <amount>`'
    );
  if (!Number.isInteger(Number(args[0])))
    return message.channel.send('Please enter an integer value');
  message.channel.bulkDelete(args[0]).then(() => {
    message.channel
      .send(`Cleared ${args[0]} messages`)
      .then(msg => msg.delete(1500))
      .catch(console.error);
  });
};

module.exports.help = {
  name: 'clear'
};
