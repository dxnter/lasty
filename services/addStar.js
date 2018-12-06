const Discord = require('discord.js');
const RichEmbed = Discord.RichEmbed;

const { extension } = require('../utils/util');

const addStar = async (reaction, user) => {
  const message = reaction.message;
  if (reaction.emoji.name !== '⭐') return;
  if (message.author.id === user.id) {
    return message.channel.send(`${user}, you cannot star your own messages`);
  }
  if (message.author.bot) {
    return message.channel.send(`${user}, you cannot star bot messages.`);
  }

  const starChannel = message.guild.channels.find(
    channel => channel.name === '⭐starboard'
  );
  if (!starChannel) {
    return message.channel.send(
      'It appears that you do not have a starboard channel'
    );
  }
  const fetch = await starChannel.fetchMessages({ limit: 100 });
  const stars = fetch.find(
    m =>
      m.embeds[0].footer.text.startsWith('⭐') &&
      m.embeds[0].footer.text.endsWith(message.id)
  );
  if (stars) {
    const star = /^\⭐\s([0-9]{1,3})\s\|\s([0-9]{17,20})/.exec(
      stars.embeds[0].footer.text
    );
    const foundStar = stars.embeds[0];
    const image =
      message.attachments.size > 0
        ? await extension(reaction, message.attachments.array()[0].url)
        : '';
    const embed = new RichEmbed()
      .setColor(foundStar.color)
      .setDescription(foundStar.description)
      .setAuthor(message.author.tag, message.author.displayAvatarURL)
      .setTimestamp()
      .setFooter(`⭐ ${parseInt(star[1]) + 1} | ${message.id}`)
      .setImage(image);
    const starMsg = await starChannel.fetchMessage(stars.id);
    await starMsg.edit({ embed });
  }
  if (!stars) {
    const image =
      message.attachments.size > 0
        ? await extension(reaction, message.attachments.array()[0].url)
        : '';
    if (image === '' && message.cleanContent.length < 1)
      return message.channel.send(`${user}, you cannot star an empty message.`);
    const embed = new RichEmbed()
      .setColor(15844367)
      .setDescription(message.cleanContent)
      .setAuthor(message.author.tag, message.author.displayAvatarURL)
      .setTimestamp(new Date())
      .setFooter(`⭐ 1 | ${message.id}`)
      .setImage(image);
    await starChannel.send({ embed });
  }
};

module.exports = addStar;
