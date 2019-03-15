import Discord from 'discord.js';
import axios from 'axios';

module.exports.run = async (bot, message, args) => {
  const {
    data: { image, answer }
  } = await axios.get('http://yesno.wtf/api/');

  message.channel.send(
    new Discord.RichEmbed()
      .setColor('#E31C23')
      .setTitle(answer === 'yes' ? '✔️' : '🚫')
      .setImage(image)
  );
};

module.exports.help = {
  name: 'yesno'
};
