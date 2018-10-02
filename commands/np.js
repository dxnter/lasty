const Discord = require('discord.js');
const axios = require('axios');

const User = require('../models/user');

const { LASTFM_API_KEY } = process.env;
const LASTFM_API_URL = 'http://ws.audioscrobbler.com/2.0/?method=';

module.exports.run = async (bot, message, args) => {
  let fmUser = args[0];
  if (!fmUser) {
    const dbUser = await User.findOne({ userID: message.author.id });
    fmUser = dbUser.lastFM;
  }

  const USER_INFO = 'user.getInfo';
  const USER_QUERY_STRING = `&user=${fmUser}&api_key=${LASTFM_API_KEY}&format=json`;
  const userRequestURL = `${LASTFM_API_URL}${USER_INFO}${USER_QUERY_STRING}`;
  axios
    .get(userRequestURL)
    .then(userRes => {
      const {
        data: {
          user: { playcount },
        },
      } = userRes;

      const RECENT_TRACKS = 'user.getRecentTracks';
      const SONG_QUERY_STRING = `&user=${fmUser}&api_key=${LASTFM_API_KEY}&limit=2&format=json`;
      const songRequestURL = `${LASTFM_API_URL}${RECENT_TRACKS}${SONG_QUERY_STRING}`;
      axios
        .get(songRequestURL)
        .then(res => {
          const latestTrack = res.data.recenttracks.track[0];

          if (!latestTrack) {
            return message.channel.send(`${fmUser} hasn't listen to anything lately...`);
          }

          const {
            name: track,
            artist: { '#text': artist },
            album: { '#text': album },
            url: songUrl,
          } = latestTrack;

          const ARTIST_INFO = 'artist.getInfo';
          const ARTIST_QUERY_STRING = `&artist=${artist}&api_key=${LASTFM_API_KEY}&username=${fmUser}&format=json`;
          const artistRequestURL = `${LASTFM_API_URL}${ARTIST_INFO}${ARTIST_QUERY_STRING}`;
          axios
            .get(artistRequestURL)
            .then(artistRes => {
              const {
                data: {
                  artist: { url },
                  artist: {
                    stats: { userplaycount },
                  },
                },
              } = artistRes;

              const avatarURL = `https://cdn.discordapp.com/avatars/${message.author.id}/${message.author.avatar}`;

              const embed = new Discord.RichEmbed()
                .setAuthor(`Last.FM: ${fmUser}`, avatarURL, `http://www.last.fm/user/${fmUser}`)
                .setThumbnail(latestTrack.image[2]['#text'])
                .addField('Track', `[${track}](${songUrl.replace(')', '\\)')})`, true)
                .addField('Artist', `[${artist}](${url})`, true)
                .setFooter(
                  `'${artist}' Scrobbles: ${userplaycount || 0} | Total Scrobbles: ${playcount || 0} | Album: ${album}`
                );

              message.channel.send(embed).then(async embedMessage => {
                await embedMessage.react('👍');
                await embedMessage.react('👎');
              });
            })
            .catch(err => {
              console.log('Error:', err);
            });
        })
        .catch(err => {
          console.log('Error:', err);
        });
    })
    .catch(err => message.channel.send(`The Last.FM user **${fmUser}** doesn't exist!`));
};

module.exports.help = {
  name: 'np',
};
