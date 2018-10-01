const Discord = require('discord.js');

module.exports.run = async (bot, message, args) => {
  const user = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[0]));
  if (!user) return message.channel.send("Can't find user!");
  const reason = args.join(' ').slice(22);
  if (!reason) return message.channel.send('Please supply a kick reason\n`,kick <@username> <reason>`');
  if (!message.member.hasPermission('MANAGE_MESSAGES')) return message.channel.send('No can do pal!');
  if (user.hasPermission('MANAGE_MESSAGES')) return message.channel.send("That person can't be kicked");

  message.guild.member(user).kick(reason);

  return message.channel.send(
    new Discord.RichEmbed()
      .setTitle('Kick')
      .setColor('#E31C23')
      .addField('Kicked User', `${user} with ID: ${user.id}`)
      .addField('Kicked By', `<@${message.author.id}> with ID ${message.author.id}`)
      .addField('Kicked In', message.channel)
      .addField('Time', message.createdAt)
      .addField('Reason', reason)
  );
};

module.exports.help = {
  name: 'kick',
};
