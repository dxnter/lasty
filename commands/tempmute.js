const Discord = require('discord.js');
const ms = require('ms');

module.exports.run = async (bot, message, args) => {
  const userToMute = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[0]));
  if (!userToMute) return message.reply("Couldn't find user.");
  if (userToMute.hasPermission('MANAGE_MESSAGES')) return message.reply("Can't mute them!");
  let mutedRole = message.guild.roles.find(`name`, 'muted');
  if (!mutedRole) {
    try {
      mutedRole = await message.guild.createRole({
        name: 'muted',
        color: '#000000',
        permissions: [],
      });
      message.guild.channels.forEach(async (channel, id) => {
        await channel.overwritePermissions(mutedRole, {
          SEND_MESSAGES: false,
          ADD_REACTIONS: false,
        });
      });
    } catch (e) {
      console.log(e.stack);
    }
  }
  const muteTime = args[1];
  if (!muteTime) return message.reply("You didn't specify a time!");

  await userToMute.addRole(mutedRole.id);
  message.channel.send(`<@${userToMute.id}> has been muted for ${ms(ms(muteTime))}`);

  setTimeout(() => {
    userToMute.removeRole(mutedRole.id);
    message.channel.send(`<@${userToMute.id}> has been unmuted!`);
  }, ms(muteTime));
};

module.exports.help = {
  name: 'tempmute',
};
