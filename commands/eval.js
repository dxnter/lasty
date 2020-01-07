// https://github.com/kurisubrooks/midori/blob/master/commands/admin/eval.js

module.exports.run = async (bot, message, args) => {
  const regex = new RegExp(
    bot.token
      .replace(/\./g, '\\.')
      .split('')
      .join('.?'),
    'g'
  );

  const input = `📥\u3000**Input:**\n\`\`\`js\n${args.join(' ')}\n\`\`\``;
  const error = err => `🚫\u3000**Error:**\n\`\`\`js\n${err.toString().replace(regex, '[Token]')}\n\`\`\``;

  try {
    let output = eval(args.join(' '));
    if (typeof output !== 'string')
      output = require('util').inspect(output, { depth: 1 });
    const response = `📤\u3000**Output:**\n\`\`\`js\n${output.replace(regex, '[Token]')}\n\`\`\``;
    if (input.length + response.length > 1900) throw new Error('Output too long!');
    return message.channel.send(`${input}\n${response}`).catch(err => message.channel.send(`${input}\n${error(err)}`));
  } catch (err) {
    return message.channel
      .send(`${input}\n${error(err)}`)
      .catch(err => message.channel.send(`${input}\n${error(err)}`));
  }
};

module.exports.help = {
  name: 'eval',
};
