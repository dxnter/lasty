import Discord from 'discord.js';

module.exports.run = (bot, message, args) =>
  message.channel.send(
    new Discord.RichEmbed()
      .setColor('#E31C23')
      .addField('Lasty Commands', `Run commands with prefix \`${process.env.PREFIX}\``)
      .addField('`lf`', 'Last.FM statistics and charts, `,lf help`')
      .addField('`np`', 'Shows last played track on Last.FM `,np` or `,np [username]`')
      .addField('cat', 'Shows a random cat picture')
      .addField('doggo', 'Shows a random dog picture')
      .addField('eval', 'Evaluates JavaScript code')
      .addField('leet', 'Translate a sentence into l33tsp3@K!')
      .addField('`botinfo`', 'Display information about Lasty')
      .addField('`serverinfo`', 'Display information about the server')
      .addField('tableflip', '(-°□°)-  ┬─┬')
      .addField('yesno', 'Shows a yes or no reaction gif')
  );

module.exports.help = {
  name: 'help',
};
