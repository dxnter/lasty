import Discord from 'discord.js';
import axios from 'axios';

module.exports.run = async (bot, message, args) => {
  const { data: { file } } = await axios.get('https://aws.random.cat/meow');

  message.channel.send(
    new Discord.RichEmbed()
      .setColor('#E31C23')
      .setTitle('Cat :cat:')
      .setImage(file)
  );
};

module.exports.help = {
  name: 'cat',
};
