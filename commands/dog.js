const Discord = require('discord.js');
const axios = require('axios');

module.exports.run = async (bot, message, args) => {
  const {
    data: { url },
  } = await axios.get('https://random.dog/woof.json');

  return message.channel.send(
    new Discord.RichEmbed()
      .setColor('#E31C23')
      .setTitle('Doggo :dog:')
      .setImage(url)
  );
};

module.exports.help = {
  name: 'doggo',
};
