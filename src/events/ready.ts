import { CommandoClient } from 'discord.js-commando';
import chalk from 'chalk';
const log = console.log;

module.exports = (client: CommandoClient) => {
  log(chalk`{green.bold [Success]} {green Valid Last.fm API Key}`);
  log(
    chalk`{cyan.bold [Discord.js]} {white.bold ${client!.user!.username
      }} {cyan.bold is online!}`
  );
  client?.user?.setActivity(' ,help', { type: 'LISTENING' });
};
