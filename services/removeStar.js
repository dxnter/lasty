const Discord = require('discord.js');
const RichEmbed = Discord.RichEmbed;

const { extension } = require('../utils/util');

const removeStar = async (reaction, user) => {
  const message = reaction.message;
  if (message.author.id === user.id) return;
  if (reaction.emoji.name !== '⭐') return;
  const starChannel = message.guild.channels.find(
    channel => channel.name === '⭐starboard'
  );
  if (!starChannel)
    return message.channel.send(
      `It appears that you do not have a starboard channel.`
    );
  const fetchedMessages = await starChannel.fetchMessages({ limit: 100 });
  const stars = fetchedMessages.find(
    m =>
      m.embeds[0].footer.text.startsWith('⭐') &&
      m.embeds[0].footer.text.endsWith(reaction.message.id)
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
      .setFooter(`⭐ ${parseInt(star[1]) - 1}`)
      .setImage(image);
    const starMsg = await starChannel.fetchMessage(stars.id);
    await starMsg.edit({ embed });
    if (parseInt(star[1]) - 1 == 0) return starMsg.delete(1000);
  }
};

module.exports = removeStar;
