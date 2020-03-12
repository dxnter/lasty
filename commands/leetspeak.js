import { characterMap } from '../constants';

function translate(message) {
  let newMessage;
  Object.entries(characterMap).forEach((letter, newLetter) => {
    newMessage = message.replace(new RegExp(letter, 'g'), newLetter);
  });
  return newMessage;
}

module.exports.run = (bot, message, args) => {
  if (args.length > 0) {
    const translatedMessage = translate(args.join(' '));
    message.channel.send(translatedMessage);
  } else {
    message.channel.send(
      `<@${message.author.id}>, *You need to type something to encode your message into l337sp3@K!*`
    );
  }
};

module.exports.help = {
  name: 'leet'
};
