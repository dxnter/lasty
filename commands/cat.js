const Discord = require('discord.js');
const superagent = require('superagent');

module.exports.run = async (bot, message, args) => {
  const { body } = await superagent.get('https://aws.random.cat/meow');

  message.channel.send(
    new Discord.RichEmbed()
      .setColor('#E31C23')
      .setTitle('Cat :cat:')
      .setImage(body.file)
  );
};

module.exports.help = {
  name: 'cat',
};
