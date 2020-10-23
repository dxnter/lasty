import chalk from 'chalk';
const log = console.log;

module.exports = client => {
  log(chalk`{green.bold [Success]} {green Valid Last.fm API Key}`);
  log(
    chalk`{cyan.bold [Discord.js]} {white.bold ${client.user.username}} {cyan is online!}`
  );
  client.user.setActivity(' ,help', { type: 'LISTENING' });
};
