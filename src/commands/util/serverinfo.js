import { Command } from 'discord.js-commando';
import { MessageEmbed } from 'discord.js';

export default class ServerInfoCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'serverinfo',
      memberName: 'serverinfo',
      group: 'util',
      description: 'Returns basic information about the Discord server',
      guildOnly: true,
      throttling: {
        usages: 1,
        duration: 10
      }
    });
  }

  async run(msg) {
    console.log(msg.guild.createdAt);
    return msg.embed(
      new MessageEmbed()
        .setColor('#E31C23')
        .setTitle('Server Information')
        .addField('Server Name', msg.guild.name)
        .addField('Total Members', msg.guild.memberCount)
        .addField('Created On', msg.guild.createdAt)
    );
  }
}
