const Discord = require('discord.js');

module.exports.noPerms = (message, perm) => {
  const embed = new Discord.RichEmbed()
    .setAuthor(message.author.username)
    .setTitle('NO PERMS')
    .setColor('#E31C23')
    .addField('Insufficient permission', perm);

  message.channel.send(embed).then(m => m.delete(5000));
};
