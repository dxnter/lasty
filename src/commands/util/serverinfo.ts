import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { Message, MessageEmbed } from 'discord.js';
import { EMBED_COLOR } from '../../../config.json';

export default class ServerInfoCommand extends Command {
  constructor(client: CommandoClient) {
    super(client, {
      name: 'serverinfo',
      memberName: 'serverinfo',
      group: 'util',
      description: 'Returns basic information about the Discord server',
      guildOnly: true,
      throttling: {
        usages: 1,
        duration: 5
      }
    });
  }

  async run(msg: CommandoMessage): Promise<Message | Message[]> {
    return msg.embed(
      new MessageEmbed()
        .setTitle('Server Information')
        .addField('Server Name', msg.guild.name)
        .addField('Total Members', msg.guild.memberCount)
        .addField('Created On', msg.guild.createdAt)
        .setColor(EMBED_COLOR)
    );
  }
}
