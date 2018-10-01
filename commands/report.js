const Discord = require('discord.js');

module.exports.run = async (bot, message, args) => {
  const user = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[0]));
  if (!user) return message.channel.send("Couldn't find user.");
  const reason = args.join(' ').slice(22);

  return message.channel.send(
    new Discord.RichEmbed()
      .setTitle('Report')
      .setColor('#E31C23')
      .addField('Reported User', `${user} with ID: ${user.id}`)
      .addField('Reported By', `${message.author} with ID: ${message.author.id}`)
      .addField('Channel', message.channel)
      .addField('Time', message.createdAt)
      .addField('Reason', reason)
  );
};

module.exports.help = {
  name: 'report',
};
