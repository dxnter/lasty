const Discord = require('discord.js');
const superagent = require('superagent');

module.exports.run = async (bot, message, args) => {
  const { body } = await superagent.get('https://random.dog/woof.json');

  return message.channel.send(
    new Discord.RichEmbed()
      .setColor('#E31C23')
      .setTitle('Doggo :dog:')
      .setImage(body.url)
  );
};

module.exports.help = {
  name: 'doggo',
};
