const Discord = require('discord.js');

const map = {
  a: '4',
  e: '3',
  f: 'ph',
  g: '9',
  l: '1',
  o: '0',
  s: '5',
  t: '7',
  y: '`/'
};

module.exports.run = (bot, message, args) => {
  if (args.length > 0) {
    const translatedMessage = translate(args.join(' '));
    message.channel.send(translatedMessage);
  } else {
    message.channel.send(
      `<@${
        message.author.id
      }>, *You need to type something to encode your message into l337sp3@K!*`
    );
  }
};

function translate(message) {
  for (const letter in map) {
    message = message.replace(new RegExp(letter, 'g'), map[letter]);
  }
  return message;
}

module.exports.help = {
  name: 'leet'
};
