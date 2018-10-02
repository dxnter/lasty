const Discord = require('discord.js');

const { LASTFM_API_KEY } = process.env;
const LASTFM_API_URL = 'http://ws.audioscrobbler.com/2.0/?method=';

module.exports.run = async (bot, message, args) => {
  console.log(args);
};

module.exports.help = {
  name: 'lf',
};
