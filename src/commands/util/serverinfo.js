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
    return msg.embed(
      new MessageEmbed()
        .setTitle('Server Information')
        .addField('Server Name', msg.guild.name)
        .addField('Total Members', msg.guild.memberCount)
        .addField('Created On', msg.guild.createdAt)
        .setColor(this.client.color)
    );
  }
}
