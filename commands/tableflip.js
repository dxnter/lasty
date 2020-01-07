import { Util } from '../utils/util';

const frames = ['(-°□°)-  ┬─┬', '(╯°□°)╯    ]', '(╯°□°)╯  ︵  ┻━┻', '(╯°□°)╯       [', '(╯°□°)╯           ┬─┬'];

module.exports.run = async (bot, message, args) => {
  const msg = await message.channel.send('(\\\\°□°)\\\\  ┬─┬');
  frames.forEach(async frame => {
    await Util.delay(100);
    await msg.edit(frame);
  });
  return message;
};

module.exports.help = {
  name: 'tableflip',
};
