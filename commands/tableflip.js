import { delay } from '../utils/util';

const frames = ['(-°□°)-  ┬─┬', '(╯°□°)╯    ]', '(╯°□°)╯  ︵  ┻━┻', '(╯°□°)╯       [', '(╯°□°)╯           ┬─┬'];

module.exports.run = async (bot, message, args) => {
  const msg = await message.channel.send('(\\\\°□°)\\\\  ┬─┬');
  frames.forEach(async frame => {
    await delay(100);
    await msg.edit(frame);
  });
  return message;
};

module.exports.help = {
  name: 'tableflip',
};
