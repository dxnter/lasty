const { MessageEmbed } = require('discord.js');
const GoogleImages = require('google-images');
const { Embeds } = require('discord-paginationembed');

const { CSE_ENGINE_ID, GOOGLE_API_KEY } = process.env;

module.exports.run = async (bot, message, args) => {
  if (args.length === 0) {
    message.reply('You need to provide something to search for');
  } else {
    const embeds = [];
    const imageSearch = new GoogleImages(CSE_ENGINE_ID, GOOGLE_API_KEY);
    imageSearch
      .search(...args)
      .then(images => {
        for (const [i, value] of images.entries()) {
          embeds.push(
            new MessageEmbed()
              .setFooter(`Page ${i + 1} of ${images.length}`)
              .setImage(value.url)
          );
        }
        return new Embeds()
          .setNavigationEmojis({
            back: '◀',
            jump: '🔢',
            forward: '▶',
            delete: '🗑'
          })
          .showPageIndicator(false)
          .setAuthorizedUsers([message.author.id])
          .setChannel(message.channel)
          .setArray(embeds)
          .setAuthor(
            message.member.displayName,
            message.author.displayAvatarURL()
          )
          .setPage(1)
          .setTitle('Search Results')
          .setColor('#E31C23')
          .build();
      })
      .catch(error => {
        console.log(error);
        throw new Error(error);
      });
  }
};

module.exports.help = {
  name: 'img'
};
