import { CommandoClient } from 'discord.js-commando';
import path from 'path';
import { PREFIX, OWNERS, DISCORD_BOT_TOKEN } from '../../config.json';

export default class LastyClient extends CommandoClient {
  public constructor() {
    super({
      commandPrefix: PREFIX,
      owner: OWNERS.split(',').map(id => id.trim()),
      disableMentions: 'everyone'
    });
  }

  init() {
    this.registry
      .registerDefaultTypes()
      .registerGroups([
        ['lastfm', 'Last.fm'],
        ['util', 'Util']
      ])
      .registerDefaultCommands({
        help: false,
        ping: false,
        prefix: true,
        commandState: false,
        unknownCommand: false
      })
      .registerCommandsIn(path.join(__dirname, '../commands'));

    this.on('ready', () => require('../events/ready')(this));

    this.login(DISCORD_BOT_TOKEN);
  }
}
